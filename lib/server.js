/**
 * @fileoverview Main server orchestration for Leafstone React development and build modes.
 */

const { createServer, build } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const { extractDependencies } = require('./dependency-parser');
const { extractAssets, copyAssets } = require('./asset-manager');
const { installDependencies, createTempProject, setupNodeModules } = require('./temp-project');
const path = require('path');
const fs = require('fs');

async function startServer(componentFile, port = 3000, options = {}) {
    const { buildMode = false, outputDir, isRestart = false } = options;
    // Create temporary templates for this session with unique identifier
    // Use current working directory with unique suffix to avoid permission issues with system temp
    const fallbackId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const tempDir = path.join(process.cwd(), `.leafstone-temp-${fallbackId}`);
    fs.mkdirSync(tempDir, { recursive: true, mode: 0o755 });

    console.log(`📁 Using temp directory: ${tempDir}`);

    // Read component file and extract dependencies and assets
    const componentContent = fs.readFileSync(componentFile, 'utf-8');
    const dependencies = extractDependencies(componentContent);
    const assets = extractAssets(componentContent, componentFile);

    // Set up temp project structure
    const componentName = path.basename(componentFile, '.jsx');
    const tempComponentPath = path.join(tempDir, `src/${componentName}.jsx`);

    // Create project files using extracted modules
    createTempProject(tempDir, componentName, componentContent, dependencies);
    setupNodeModules(tempDir);

    // Install custom dependencies after setting up base modules
    if (Object.keys(dependencies).length > 0) {
        await installDependencies(dependencies, tempDir);
    }

    // Copy assets to temp directory
    await copyAssets(assets, tempDir);

    // Copy favicon to public directory in temp project
    const faviconSrc = path.join(__dirname, '..', 'assets', 'favicon.svg');
    const faviconDest = path.join(tempDir, 'public', 'favicon.svg');
    const publicDir = path.join(tempDir, 'public');

    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true, mode: 0o755 });
    }

    if (fs.existsSync(faviconSrc)) {
        fs.copyFileSync(faviconSrc, faviconDest);
        fs.chmodSync(faviconDest, 0o644);
    }

    const viteConfig = {
        root: tempDir,
        plugins: [react()],
        css: {
            postcss: {
                plugins: [
                    require('tailwindcss')({
                        content: [path.join(tempDir, 'index.html'), path.join(tempDir, 'src/**/*.jsx')],
                        theme: {
                            extend: {},
                        },
                        plugins: [require('tailwind-dracula')()],
                    }),
                    require('autoprefixer'),
                ],
            },
        },
        resolve: {
            // Prioritize temp node_modules for dependency resolution
            modules: [path.join(tempDir, 'node_modules'), path.join(__dirname, '../node_modules'), 'node_modules'],
        },
        // Force rebuild when files change and include discovered dependencies
        optimizeDeps: {
            force: true,
            include: Object.keys(dependencies),
            entries: [path.join(tempDir, 'src/main.jsx')],
        },
    };

    if (buildMode) {
        // Build mode - generate static files
        viteConfig.build = {
            outDir: outputDir,
            emptyOutDir: true,
            rollupOptions: {
                input: path.join(tempDir, 'index.html'),
            },
            // Copy assets to /assets/ in build output
            copyPublicDir: false, // Don't copy public dir to root
        };

        // Configure Vite to use relative paths for assets
        viteConfig.base = './';

        await build(viteConfig);

        // Manually copy assets to /assets/ subdirectory in build output
        if (assets.length > 0) {
            const buildAssetsDir = path.join(outputDir, 'assets');
            fs.mkdirSync(buildAssetsDir, { recursive: true, mode: 0o755 });

            for (const asset of assets) {
                const srcPath = path.join(tempDir, 'assets', asset.filename);
                const destPath = path.join(buildAssetsDir, asset.filename);
                if (fs.existsSync(srcPath)) {
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`📁 Copied ${asset.filename} to build /assets/`);
                }
            }
        }
        console.log(`✅ Build complete! Files generated in: ${outputDir}`);
        console.log(`🌐 Deploy the ${outputDir} directory to any static hosting service`);
    } else {
        // Dev server mode
        viteConfig.server = {
            port: parseInt(port),
            open: !isRestart, // Only open browser on initial start, not on restarts
            watch: {
                include: [componentFile, path.join(tempDir, 'src/**/*.jsx')],
            },
        };

        const server = await createServer(viteConfig);
        await server.listen();

        console.log(`✅ Server running at http://localhost:${port}`);
        console.log(`📦 Watching for changes in: ${componentFile}`);

        // Track current dependencies and assets for change detection
        const currentDependencies = JSON.stringify(dependencies);
        const currentAssets = JSON.stringify(assets);
        let isRestarting = false; // Flag to prevent race conditions

        // Watch the original component file and update the temp copy when it changes
        fs.watchFile(componentFile, (_curr, _prev) => {
            if (isRestarting) {
                return;
            } // Prevent race condition during restart

            console.log(`🔄 Component file changed, checking for updates...`);
            const updatedContent = fs.readFileSync(componentFile, 'utf-8');

            // Check if @requires or @requires-asset comments changed
            const newDependencies = extractDependencies(updatedContent);
            const newAssets = extractAssets(updatedContent, componentFile);

            const newDependenciesStr = JSON.stringify(newDependencies);
            const newAssetsStr = JSON.stringify(newAssets);

            if (newDependenciesStr !== currentDependencies || newAssetsStr !== currentAssets) {
                console.log(`🔄 Dependencies or assets changed, restarting server...`);
                if (newDependenciesStr !== currentDependencies) {
                    console.log(`📦 Dependency changes detected`);
                }
                if (newAssetsStr !== currentAssets) {
                    console.log(`🎨 Asset changes detected`);
                }

                isRestarting = true; // Set flag to prevent further watcher events

                // Clean up file watcher first
                fs.unwatchFile(componentFile);

                // Clean up current server
                server.close();
                fs.rmSync(tempDir, { recursive: true, force: true });

                // Restart with new configuration
                setTimeout(() => {
                    startServer(componentFile, port, { ...options, isRestart: true });
                }, 100);
                return;
            }

            // No dependency/asset changes, just update the temp copy
            try {
                fs.writeFileSync(tempComponentPath, updatedContent, { mode: 0o644 });
            } catch (error) {
                if (!isRestarting) {
                    console.error(`❌ Error updating temp component: ${error.message}`);
                }
            }
        });

        // Cleanup on exit for dev server
        process.on('SIGTERM', () => {
            console.log(`🧹 Cleaning up temporary files and shutting down...`);
            fs.unwatchFile(componentFile);
            fs.rmSync(tempDir, { recursive: true, force: true });
            server.close();
        });

        process.on('SIGINT', () => {
            console.log(`🧹 Cleaning up temporary files and shutting down...`);
            fs.unwatchFile(componentFile);
            fs.rmSync(tempDir, { recursive: true, force: true });
            server.close();
            process.exit(0);
        });
    }

    // Clean up temp directory after build mode
    if (buildMode) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

module.exports = { startServer };
