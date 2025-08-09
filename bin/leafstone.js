#!/usr/bin/env node

const { startServer } = require('../lib/server');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
  .usage('$0 [options] <component> [port]')
  .option('build', {
    alias: 'b',
    describe: 'Build component for static deployment',
    type: 'string',
  })
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
  .example('$0 Counter.jsx', 'Start dev server for Counter.jsx on port 3000')
  .example('$0 components/Button.jsx 3001', 'Start dev server for Button.jsx on port 3001')
  .example('$0 --build ./dist Counter.jsx', 'Build Counter.jsx to ./dist directory')
  .example('$0 -b ./output Chart.jsx', 'Build Chart.jsx to ./output directory')
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .argv;

const componentFile = path.resolve(process.cwd(), argv.component);
const port = argv.port;
const buildDir = argv.build;

// Check if file exists and is a .jsx file
if (!fs.existsSync(componentFile)) {
  console.error(`Error: File "${componentFile}" does not exist`);
  process.exit(1);
}

if (!componentFile.endsWith('.jsx')) {
  console.error(`Error: File must have .jsx extension`);
  process.exit(1);
}

if (buildDir) {
  // Build mode
  const outputDir = path.resolve(process.cwd(), buildDir);
  console.log(`🏗️  Building Leafstone React component...`);
  console.log(`📄 Component file: ${componentFile}`);
  console.log(`📦 Output directory: ${outputDir}`);
  
  startServer(componentFile, port, { buildMode: true, outputDir });
} else {
  // Dev server mode
  console.log(`🚀 Starting Leafstone React dev server...`);
  console.log(`📄 Component file: ${componentFile}`);
  console.log(`🌐 Port: ${port}`);
  
  startServer(componentFile, port);
}