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
  
  // Copy templates
  const templatesDir = path.join(__dirname, '../templates');
  const indexHtml = fs.readFileSync(path.join(templatesDir, 'index.html'), 'utf-8');
  const mainJsx = fs.readFileSync(path.join(templatesDir, 'main.jsx'), 'utf-8');
  
  fs.writeFileSync(path.join(tempDir, 'index.html'), indexHtml);
  fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(tempDir, 'src/main.jsx'), mainJsx);
  
  // Create Vite server
  const server = await createServer({
    root: tempDir,
    plugins: [
      react(),
      jsxDevServerPlugin(componentsDir)
    ],
    server: {
      port: parseInt(port),
      open: true,
      watch: {
        include: [path.join(componentsDir, '**/*.jsx')]
      }
    },
    resolve: {
      alias: {
        '@components': componentsDir
      }
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