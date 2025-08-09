function jsxDevServerPlugin() {
  return {
    name: 'jsx-dev-server',
    // Plugin no longer needs middleware since component is copied to temp directory
  };
}

module.exports = { jsxDevServerPlugin };