#!/usr/bin/env node

const { startServer } = require('../lib/server');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .usage('$0 <component> [port]')
  .command(
    '$0 <component> [port]', 
    'Start development server for a React component',
    (yargs) => {
      yargs
        .positional('component', {
          describe: 'Path to the JSX component file',
          type: 'string'
        })
        .positional('port', {
          describe: 'Port number for the development server',
          type: 'number',
          default: 3000
        });
    }
  )
  .example('$0 Counter.jsx', 'Start server for Counter.jsx on port 3000')
  .example('$0 components/Button.jsx 3001', 'Start server for Button.jsx on port 3001')
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .argv;

const componentFile = path.resolve(process.cwd(), argv.component);
const port = argv.port;

// Check if file exists and is a .jsx file
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