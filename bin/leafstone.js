#!/usr/bin/env node

const { startServer } = require('../lib/server');
const path = require('path');

// Get the file argument
const args = process.argv.slice(2);
const targetFile = args[0] || './examples/Counter.jsx';
const port = args[1] || 3000;

// Resolve the target file path
const componentFile = path.resolve(process.cwd(), targetFile);

// Check if file exists and is a .jsx file
const fs = require('fs');
if (!fs.existsSync(componentFile)) {
  console.error(`Error: File "${componentFile}" does not exist`);
  process.exit(1);
}

if (!componentFile.endsWith('.jsx')) {
  console.error(`Error: File must have .jsx extension`);
  process.exit(1);
}

console.log(`🚀 Starting Leafstone React dev server...`);
console.log(`📄 Component file: ${componentFile}`);
console.log(`🌐 Port: ${port}`);

startServer(componentFile, port);