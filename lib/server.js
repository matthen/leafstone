const { createServer, build } = require("vite");
const react = require("@vitejs/plugin-react-swc");
const { jsxDevServerPlugin } = require("./plugin");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

function extractDependencies(jsxContent) {
  const requiresRegex = /\/\/ @requires (.+)/g;
  const dependencies = {};
  let match;

  while ((match = requiresRegex.exec(jsxContent)) !== null) {
    const depString = match[1].trim();

    // Handle both "package@version" and "package" formats
    if (depString.includes("@")) {
      const lastAtIndex = depString.lastIndexOf("@");
      const pkg = depString.substring(0, lastAtIndex);
      const version = depString.substring(lastAtIndex + 1);
      dependencies[pkg] = version;
    } else {
      dependencies[depString] = "latest";
    }
  }

  return dependencies;
}

function extractAssets(jsxContent, componentFile) {
  const requiresAssetRegex = /^\/\/ @requires-asset (.+)$/gm;
  const assets = [];
  const usedFilenames = new Set();
  let match;

  while ((match = requiresAssetRegex.exec(jsxContent)) !== null) {
    const parts = match[1].trim().split(/\s+/);
    const assetPath = parts[0];
    const customFilename = parts[1]; // optional destination filename
    
    // Resolve relative paths relative to the component file
    const resolvedPath = path.resolve(path.dirname(componentFile), assetPath);
    const filename = customFilename || path.basename(assetPath);
    
    // Check for filename conflicts
    if (usedFilenames.has(filename)) {
      console.error(`❌ Asset filename conflict: "${filename}" is used by multiple assets`);
      console.error(`   Consider using custom filenames: // @requires-asset ${assetPath} ${filename.replace('.', '-2.')}`);
      process.exit(1);
    }
    
    usedFilenames.add(filename);
    assets.push({
      sourcePath: resolvedPath,
      filename: filename,
      urlPath: `/assets/${filename}`
    });
  }

  return assets;
}

async function copyAssets(assets, tempDir) {
  if (assets.length === 0) return;
  
  const assetsDir = path.join(tempDir, "assets");
  fs.mkdirSync(assetsDir, { recursive: true, mode: 0o755 });
  
  console.log(`🎨 Copying assets: ${assets.map(a => a.filename).join(', ')}`);
  
  for (const asset of assets) {
    try {
      if (!fs.existsSync(asset.sourcePath)) {
        console.error(`❌ Asset not found: ${asset.sourcePath}`);
        continue;
      }
      
      const destPath = path.join(assetsDir, asset.filename);
      fs.copyFileSync(asset.sourcePath, destPath);
      fs.chmodSync(destPath, 0o644);
      console.log(`✅ Copied ${asset.filename} to /assets/`);
      
    } catch (error) {
      console.error(`❌ Failed to copy ${asset.filename}: ${error.message}`);
    }
  }
}

async function installDependencies(dependencies, tempDir) {
  if (Object.keys(dependencies).length === 0) return;

  const packages = Object.entries(dependencies)
    .map(([pkg, version]) => (version === "latest" ? pkg : `${pkg}@${version}`))
    .join(" ");

  console.log(
    `📦 Installing dependencies: ${Object.keys(dependencies).join(", ")}`
  );

  try {
    execSync(`npm install ${packages}`, {
      cwd: tempDir,
      stdio: "inherit",
      timeout: 120000, // 2 minutes timeout
    });

    // Verify installation
    const nodeModulesPath = path.join(tempDir, "node_modules");
    for (const pkg of Object.keys(dependencies)) {
      if (!fs.existsSync(path.join(nodeModulesPath, pkg))) {
        console.error(`❌ Package ${pkg} was not installed correctly`);
      } else {
        console.log(`✅ Package ${pkg} installed successfully`);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to install dependencies: ${error.message}`);
    process.exit(1);
  }
}

async function startServer(componentFile, port = 3000, options = {}) {
  const { buildMode = false, outputDir } = options;
  // Create temporary templates for this session with unique identifier
  // Use current working directory with unique suffix to avoid permission issues with system temp
  const fallbackId =
    Date.now().toString(36) + Math.random().toString(36).substr(2);
  const tempDir = path.join(process.cwd(), `.leafstone-temp-${fallbackId}`);
  fs.mkdirSync(tempDir, { recursive: true, mode: 0o755 });

  console.log(`📁 Using temp directory: ${tempDir}`);

  // Read component file and extract dependencies and assets
  const componentContent = fs.readFileSync(componentFile, "utf-8");
  const dependencies = extractDependencies(componentContent);
  const assets = extractAssets(componentContent, componentFile);

  // Copy templates and config
  const templatesDir = path.join(__dirname, "../templates");
  const componentName = path.basename(componentFile, ".jsx");

  const indexHtml = fs
    .readFileSync(path.join(templatesDir, "index.html"), "utf-8")
    .replace(/\{\{componentName\}\}/g, componentName);
  const mainJsxTemplate = fs.readFileSync(
    path.join(templatesDir, "main.jsx"),
    "utf-8"
  );
  // Update the main.jsx to import the copied component instead of using alias
  const mainJsx = mainJsxTemplate.replace(
    `const module = await import('@component');`,
    `const module = await import('./${componentName}.jsx');`
  );
  const stylesCss = fs.readFileSync(
    path.join(templatesDir, "styles.css"),
    "utf-8"
  );
  // Create dynamic PostCSS config with proper paths
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind.config.js' },
    autoprefixer: {},
  },
}`;
  // Create dynamic tailwind config that includes the component file
  // Use absolute paths to ensure Tailwind finds all files
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ${JSON.stringify(path.join(tempDir, "index.html"))},
    ${JSON.stringify(path.join(tempDir, "src/**/*.jsx"))},
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwind-dracula")(),
  ],
}`;

  // Copy the component file to temp directory so Vite can resolve its dependencies
  const tempComponentPath = path.join(tempDir, `src/${componentName}.jsx`);

  // Create all the files first with explicit permissions
  const filesToCreate = [
    { path: "index.html", content: indexHtml },
    { path: "styles.css", content: stylesCss },
    { path: "tailwind.config.js", content: tailwindConfig },
    { path: "postcss.config.js", content: postcssConfig },
    { path: "src/main.jsx", content: mainJsx },
    { path: `src/${componentName}.jsx`, content: componentContent },
  ];

  for (const file of filesToCreate) {
    const fullPath = path.join(tempDir, file.path);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    }

    fs.writeFileSync(fullPath, file.content, { mode: 0o644 });
  }

  // Create a package.json in temp dir that includes discovered dependencies
  const tempPackageJson = {
    name: "leafstone-temp",
    private: true,
    dependencies: {
      react: "^19.1.1",
      "react-dom": "^19.1.1",
      "lucide-react": "^0.539.0",
      ...dependencies, // Add discovered dependencies
    },
  };
  fs.writeFileSync(
    path.join(tempDir, "package.json"),
    JSON.stringify(tempPackageJson, null, 2),
    { mode: 0o644 }
  );

  // Set up node_modules - always copy essential modules first, then install custom deps
  const tempNodeModules = path.join(tempDir, "node_modules");
  const sourceNodeModules = path.join(__dirname, "../node_modules");

  // Always ensure we have the essential modules
  const essentialModules = [
    "react",
    "react-dom",
    "lucide-react",
    "@types",
    "scheduler",
  ];
  fs.mkdirSync(tempNodeModules, { recursive: true });

  for (const module of essentialModules) {
    const sourcePath = path.join(sourceNodeModules, module);
    const targetPath = path.join(tempNodeModules, module);

    if (fs.existsSync(sourcePath)) {
      try {
        fs.cpSync(sourcePath, targetPath, { recursive: true });
      } catch (err) {
        console.log(`⚠️  Could not copy ${module}:`, err.message);
      }
    }
  }

  // Install custom dependencies after setting up base modules
  if (Object.keys(dependencies).length > 0) {
    await installDependencies(dependencies, tempDir);
  }

  // Copy assets to temp directory
  await copyAssets(assets, tempDir);

  const viteConfig = {
    root: tempDir,
    plugins: [react(), jsxDevServerPlugin()],
    css: {
      postcss: {
        plugins: [
          require("tailwindcss")({
            content: [
              path.join(tempDir, "index.html"),
              path.join(tempDir, "src/**/*.jsx"),
            ],
            theme: {
              extend: {},
            },
            plugins: [require("tailwind-dracula")()],
          }),
          require("autoprefixer"),
        ],
      },
    },
    resolve: {
      // Prioritize temp node_modules for dependency resolution
      modules: [
        path.join(tempDir, "node_modules"),
        path.join(__dirname, "../node_modules"),
        "node_modules",
      ],
    },
    // Force rebuild when files change and include discovered dependencies
    optimizeDeps: {
      force: true,
      include: Object.keys(dependencies),
      entries: [path.join(tempDir, "src/main.jsx")],
    },
  };

  if (buildMode) {
    // Build mode - generate static files
    viteConfig.build = {
      outDir: outputDir,
      emptyOutDir: true,
      rollupOptions: {
        input: path.join(tempDir, "index.html"),
      },
      // Copy assets to /assets/ in build output
      copyPublicDir: false,  // Don't copy public dir to root
    };
    
    await build(viteConfig);
    
    // Manually copy assets to /assets/ subdirectory in build output
    if (assets.length > 0) {
      const buildAssetsDir = path.join(outputDir, "assets");
      fs.mkdirSync(buildAssetsDir, { recursive: true, mode: 0o755 });
      
      for (const asset of assets) {
        const srcPath = path.join(tempDir, "assets", asset.filename);
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
      open: true,
      watch: {
        include: [componentFile, path.join(tempDir, "src/**/*.jsx")],
      },
    };

    const server = await createServer(viteConfig);
    await server.listen();

    console.log(`✅ Server running at http://localhost:${port}`);
    console.log(`📦 Watching for changes in: ${componentFile}`);

    // Watch the original component file and update the temp copy when it changes
    fs.watchFile(componentFile, (curr, prev) => {
      console.log(`🔄 Component file changed, updating...`);
      const updatedContent = fs.readFileSync(componentFile, "utf-8");
      fs.writeFileSync(tempComponentPath, updatedContent, { mode: 0o644 });
    });
  }

  // Cleanup on exit (only in dev mode)
  if (!buildMode) {
    process.on("SIGTERM", () => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      server.close();
    });

    process.on("SIGINT", () => {
      fs.rmSync(tempDir, { recursive: true, force: true });
      server.close();
      process.exit(0);
    });
  } else {
    // Clean up temp directory after build
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

module.exports = { startServer };
