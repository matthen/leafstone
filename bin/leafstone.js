#!/usr/bin/env node

const { startServer } = require('../lib/server');
const path = require('path');

// Get the directory argument
const args = process.argv.slice(2);
const targetDir = args[0] || './examples';
const port = args[1] || 3000;

// Resolve the target directory
const componentsDir = path.resolve(process.cwd(), targetDir);

// Check if directory exists
const fs = require('fs');
if (!fs.existsSync(componentsDir)) {
  console.error(`Error: Directory "${componentsDir}" does not exist`);
  process.exit(1);
}

console.log(`🚀 Starting Leafstone React dev server...`);
console.log(`📁 Components directory: ${componentsDir}`);
console.log(`🌐 Port: ${port}`);

startServer(componentsDir, port);