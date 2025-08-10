/**
 * @fileoverview Tests for temp project setup functionality.
 */

const { createTempProject, setupNodeModules } = require('../lib/temp-project');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('createTempProject', () => {
  let tempDir;

  beforeEach(() => {
    // Create a unique temp directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leafstone-test-'));
  });

  afterEach(() => {
    // Clean up temp directory after each test
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should create all required project files', () => {
    const componentName = 'TestComponent';
    const componentContent = `
function TestComponent() {
  return <div>Test</div>;
}
export default TestComponent;
`;
    const dependencies = { lodash: '4.17.21' };

    createTempProject(tempDir, componentName, componentContent, dependencies);

    // Check that all required files are created
    expect(fs.existsSync(path.join(tempDir, 'index.html'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'styles.css'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'tailwind.config.js'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'postcss.config.js'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'src/main.jsx'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, `src/${componentName}.jsx`))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'package.json'))).toBe(true);
  });

  test('should replace component name in index.html', () => {
    const componentName = 'MyAwesomeComponent';
    const componentContent = `function MyAwesomeComponent() { return <div>Awesome</div>; }`;
    const dependencies = {};

    createTempProject(tempDir, componentName, componentContent, dependencies);

    const indexHtml = fs.readFileSync(path.join(tempDir, 'index.html'), 'utf-8');
    expect(indexHtml).toContain('MyAwesomeComponent');
  });

  test('should include component content in jsx file', () => {
    const componentName = 'TestComponent';
    const componentContent = `
import { useState } from 'react';

function TestComponent() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(count + 1)}>Count: {count}</div>;
}

export default TestComponent;
`;
    const dependencies = {};

    createTempProject(tempDir, componentName, componentContent, dependencies);

    const jsxFile = fs.readFileSync(path.join(tempDir, `src/${componentName}.jsx`), 'utf-8');
    expect(jsxFile).toBe(componentContent);
  });

  test('should create package.json with correct dependencies', () => {
    const componentName = 'TestComponent';
    const componentContent = `function TestComponent() { return <div>Test</div>; }`;
    const dependencies = { 
      lodash: '4.17.21',
      moment: 'latest',
      axios: '^1.0.0'
    };

    createTempProject(tempDir, componentName, componentContent, dependencies);

    const packageJson = JSON.parse(fs.readFileSync(path.join(tempDir, 'package.json'), 'utf-8'));
    
    expect(packageJson.name).toBe('leafstone-temp');
    expect(packageJson.private).toBe(true);
    expect(packageJson.dependencies).toMatchObject({
      react: '^19.1.1',
      'react-dom': '^19.1.1',
      'lucide-react': '^0.539.0',
      lodash: '4.17.21',
      moment: 'latest',
      axios: '^1.0.0'
    });
  });

  test('should create package.json with only base dependencies when no custom deps', () => {
    const componentName = 'TestComponent';
    const componentContent = `function TestComponent() { return <div>Test</div>; }`;
    const dependencies = {};

    createTempProject(tempDir, componentName, componentContent, dependencies);

    const packageJson = JSON.parse(fs.readFileSync(path.join(tempDir, 'package.json'), 'utf-8'));
    
    expect(packageJson.dependencies).toEqual({
      react: '^19.1.1',
      'react-dom': '^19.1.1',
      'lucide-react': '^0.539.0'
    });
  });

  test('should create tailwind config with correct paths', () => {
    const componentName = 'TestComponent';
    const componentContent = `function TestComponent() { return <div>Test</div>; }`;
    const dependencies = {};

    createTempProject(tempDir, componentName, componentContent, dependencies);

    const tailwindConfig = fs.readFileSync(path.join(tempDir, 'tailwind.config.js'), 'utf-8');
    expect(tailwindConfig).toContain(path.join(tempDir, 'index.html'));
    expect(tailwindConfig).toContain(path.join(tempDir, 'src/**/*.jsx'));
    expect(tailwindConfig).toContain('require("tailwind-dracula")()');
  });

  test('should create main.jsx that imports the component', () => {
    const componentName = 'CustomComponent';
    const componentContent = `function CustomComponent() { return <div>Custom</div>; }`;
    const dependencies = {};

    createTempProject(tempDir, componentName, componentContent, dependencies);

    const mainJsx = fs.readFileSync(path.join(tempDir, 'src/main.jsx'), 'utf-8');
    expect(mainJsx).toContain(`import('./${componentName}.jsx')`);
  });
});

describe('setupNodeModules', () => {
  let tempDir;

  beforeEach(() => {
    // Create a unique temp directory for each test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leafstone-test-'));
  });

  afterEach(() => {
    // Clean up temp directory after each test
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should create node_modules directory', () => {
    setupNodeModules(tempDir);
    
    expect(fs.existsSync(path.join(tempDir, 'node_modules'))).toBe(true);
  });

  test('should handle missing source modules gracefully', () => {
    // This test just ensures the function doesn't crash when source modules don't exist
    expect(() => {
      setupNodeModules(tempDir);
    }).not.toThrow();
    
    expect(fs.existsSync(path.join(tempDir, 'node_modules'))).toBe(true);
  });
});