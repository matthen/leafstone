/**
 * @fileoverview Creates temporary Vite projects with React components, handles npm installation and project setup.
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function installDependencies(dependencies, tempDir) {
    if (Object.keys(dependencies).length === 0) {
        return;
    }

    const packages = Object.entries(dependencies)
        .map(([pkg, version]) => (version === 'latest' ? pkg : `${pkg}@${version}`))
        .join(' ');

    console.log(`📦 Installing dependencies: ${Object.keys(dependencies).join(', ')}`);

    try {
        execSync(`npm install ${packages}`, {
            cwd: tempDir,
            stdio: 'inherit',
            timeout: 120000, // 2 minutes timeout
        });

        // Verify installation
        const nodeModulesPath = path.join(tempDir, 'node_modules');
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

function createTempProject(tempDir, componentName, componentContent, dependencies) {
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
    ${JSON.stringify(path.join(tempDir, 'index.html'))},
    ${JSON.stringify(path.join(tempDir, 'src/**/*.jsx'))},
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwind-dracula")(),
  ],
}`;

    // Read template files
    const templatesDir = path.join(__dirname, '../templates');

    const indexHtml = fs
        .readFileSync(path.join(templatesDir, 'index.html'), 'utf-8')
        .replace(/\{\{componentName\}\}/g, componentName);

    const mainJsxTemplate = fs.readFileSync(path.join(templatesDir, 'main.jsx'), 'utf-8');

    // Update the main.jsx to import the copied component instead of using alias
    const mainJsx = mainJsxTemplate.replace(
        `const module = await import("@component");`,
        `const module = await import("./${componentName}.jsx");`,
    );

    const stylesCss = fs.readFileSync(path.join(templatesDir, 'styles.css'), 'utf-8');

    // Create all the files first with explicit permissions
    const filesToCreate = [
        { path: 'index.html', content: indexHtml },
        { path: 'styles.css', content: stylesCss },
        { path: 'tailwind.config.js', content: tailwindConfig },
        { path: 'postcss.config.js', content: postcssConfig },
        { path: 'src/main.jsx', content: mainJsx },
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
        name: 'leafstone-temp',
        private: true,
        dependencies: {
            react: '^19.1.1',
            'react-dom': '^19.1.1',
            'lucide-react': '^0.539.0',
            ...dependencies, // Add discovered dependencies
        },
    };

    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(tempPackageJson, null, 2), { mode: 0o644 });
}

function setupNodeModules(tempDir) {
    // Set up node_modules - always copy essential modules first, then install custom deps
    const tempNodeModules = path.join(tempDir, 'node_modules');
    const sourceNodeModules = path.join(__dirname, '../node_modules');

    // Always ensure we have the essential modules
    const essentialModules = ['react', 'react-dom', 'lucide-react', '@types', 'scheduler'];
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
}

module.exports = {
    installDependencies,
    createTempProject,
    setupNodeModules,
};
