const { createServer } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const { jsxDevServerPlugin } = require('./plugin');
const path = require('path');
const fs = require('fs');

async function startServer(componentsDir, port = 3000) {
  // Create temporary templates for this session
  const tempDir = path.join(process.cwd(), '.leafstone-temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Copy templates and config
  const templatesDir = path.join(__dirname, '../templates');
  const packageDir = path.join(__dirname, '..');
  
  const indexHtml = fs.readFileSync(path.join(templatesDir, 'index.html'), 'utf-8');
  const mainJsx = fs.readFileSync(path.join(templatesDir, 'main.jsx'), 'utf-8');
  const stylesCss = fs.readFileSync(path.join(templatesDir, 'styles.css'), 'utf-8');
  // Create dynamic PostCSS config with proper paths
  const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind.config.js' },
    autoprefixer: {},
  },
}`;
  // Create dynamic tailwind config that includes the components directory
  // Use absolute paths to ensure Tailwind finds all files
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ${JSON.stringify(path.join(tempDir, '**/*.{html,jsx}'))},
    ${JSON.stringify(path.join(componentsDir, '**/*.jsx'))}
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwind-dracula")(),
  ],
}`;
  
  
  // Create all the files first
  fs.writeFileSync(path.join(tempDir, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(tempDir, 'styles.css'), stylesCss);
  fs.writeFileSync(path.join(tempDir, 'tailwind.config.js'), tailwindConfig);
  fs.writeFileSync(path.join(tempDir, 'postcss.config.js'), postcssConfig);
  fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(tempDir, 'src/main.jsx'), mainJsx);
  
  // Create Vite server with inline Tailwind config
  const server = await createServer({
    root: tempDir,
    plugins: [
      react(),
      jsxDevServerPlugin(componentsDir)
    ],
    css: {
      postcss: {
        plugins: [
          require('tailwindcss')({
            content: [
              path.join(tempDir, '**/*.{html,jsx}'),
              path.join(componentsDir, '**/*.jsx')
            ],
            theme: {
              extend: {},
            },
            plugins: [
              require("tailwind-dracula")(),
            ],
          }),
          require('autoprefixer'),
        ]
      }
    },
    server: {
      port: parseInt(port),
      open: true,
      watch: {
        include: [
          path.join(componentsDir, '**/*.jsx'),
          path.join(tempDir, '**/*.{html,jsx}')
        ]
      }
    },
    resolve: {
      alias: {
        '@components': componentsDir
      }
    },
    // Force rebuild when files change
    optimizeDeps: {
      force: true
    }
  });

  await server.listen();
  
  console.log(`✅ Server running at http://localhost:${port}`);
  console.log(`📦 Watching for changes in: ${componentsDir}`);
  
  // Cleanup on exit
  process.on('SIGTERM', () => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    server.close();
  });
  
  process.on('SIGINT', () => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    server.close();
    process.exit(0);
  });
}

module.exports = { startServer };