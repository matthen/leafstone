const path = require('path');

function jsxDevServerPlugin(componentFile) {
  const componentName = path.basename(componentFile, '.jsx');
  
  return {
    name: 'jsx-dev-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url;
        
        // API endpoint to get the component info
        if (url === '/api/component') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            componentName,
            componentFile 
          }));
          return;
        }
        
        next();
      });
    }
  };
}

module.exports = { jsxDevServerPlugin };