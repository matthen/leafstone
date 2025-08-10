/**
 * @fileoverview Main module exports for Leafstone React library components.
 */

const { startServer } = require('./server');
const { extractDependencies } = require('./dependency-parser');
const { extractAssets, copyAssets } = require('./asset-manager');
const { installDependencies, createTempProject, setupNodeModules } = require('./temp-project');

module.exports = {
    startServer,
    extractDependencies,
    extractAssets,
    copyAssets,
    installDependencies,
    createTempProject,
    setupNodeModules,
};
