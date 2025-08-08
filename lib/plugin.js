const fs = require('fs');
const path = require('path');

function jsxDevServerPlugin(componentsDir) {
  return {
    name: 'jsx-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url;
        
        // API endpoint to get available components
        if (url === '/api/components') {
          try {
            const files = fs.readdirSync(componentsDir)
              .filter(f => f.endsWith('.jsx'))
              .map(f => path.basename(f, '.jsx'));
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ components: files }));
            return;
          } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ components: [], error: 'Could not read components directory' }));
            return;
          }
        }
        
        // Handle requests for .html files - redirect to hash-based routing
        if (url.endsWith('.html') && url !== '/') {
          const componentName = path.basename(url, '.html');
          const jsxFile = path.join(componentsDir, `${componentName}.jsx`);
          
          if (fs.existsSync(jsxFile)) {
            res.writeHead(302, { Location: `/#${componentName}` });
            res.end();
            return;
          }
        }
        
        next();
      });
    }
  };
}

module.exports = { jsxDevServerPlugin };