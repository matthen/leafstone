# Leafstone React

A CLI tool for quickly prototyping and testing React components with hot reloading. Just point it at a directory of JSX files and get an instant development server!

## Installation

Install globally via npm:

```bash
npm install -g leafstone-react
```

## Usage

### Basic Usage

```bash
# Start server for components in current examples/ directory
leafstone examples/

# Start server for any directory containing JSX files
leafstone ./my-components/

# Use custom port
leafstone ./components/ 3001
```

### Quick Start

1. **Create some JSX components**
   ```bash
   mkdir my-components
   ```

2. **Add a component file**
   ```jsx
   // my-components/Counter.jsx
   import { useState } from 'react';

   function Counter() {
     const [count, setCount] = useState(0);
     
     return (
       <div>
         <h1>Count: {count}</h1>
         <button onClick={() => setCount(count + 1)}>
           Increment
         </button>
       </div>
     );
   }

   export default Counter;
   ```

3. **Start the development server**
   ```bash
   leafstone my-components/
   ```

4. **Open your browser**
   - Server opens automatically at `http://localhost:3000`
   - See a list of all your components
   - Click any component to view it
   - Changes hot-reload automatically

### Features

- ✅ **Zero Configuration** - Just point at a directory of JSX files
- ✅ **Auto Discovery** - Automatically finds and lists all JSX components
- ✅ **Hot Module Replacement (HMR)** - Changes are reflected instantly
- ✅ **Component Browser** - Visual list of all available components
- ✅ **Hash Routing** - Direct links to individual components (`/#ComponentName`)
- ✅ **React DevTools Compatible** - Full React development experience

### Component Requirements

Components should:
- Be in `.jsx` files
- Export the component as default export
- Not require any props (they render in isolation)
- Use standard React patterns (hooks, state, etc.)

### Navigation

- `localhost:3000` - Component browser (lists all components)
- `localhost:3000/#ComponentName` - Direct link to specific component
- `localhost:3000/ComponentName.html` - Redirects to hash-based URL

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Local Development

1. **Clone and install**
   ```bash
   git clone <repository>
   cd leafstone-react
   npm install
   ```

2. **Link for local testing**
   ```bash
   npm link
   leafstone examples/
   ```
   
   > **What is `npm link`?** This creates a global symlink to your local development version of the package. It's like temporarily installing your in-development package globally so you can test the `leafstone` command before publishing to npm. Think of it as "install this local package globally for testing".

3. **Test the CLI locally**
   ```bash
   # Test with the included example components
   leafstone examples/
   
   # Test with your own component directory
   mkdir test-components
   # ... add some JSX files
   leafstone test-components/
   ```

### Project Structure

```
leafstone-react/
├── bin/
│   └── leafstone.js       # CLI entry point
├── lib/
│   ├── index.js          # Main library exports
│   ├── server.js         # Vite server setup
│   └── plugin.js         # Custom Vite plugin
├── templates/
│   ├── index.html        # HTML template
│   └── main.jsx          # React entry point
├── examples/             # Example components (for testing)
│   ├── Counter.jsx
│   └── Button.jsx
└── package.json          # Defines CLI binary
```

### How It Works

1. **CLI Command** - `bin/leafstone.js` processes arguments and starts server
2. **Temporary Setup** - Creates `.leafstone-temp/` directory with Vite project files
3. **Dynamic Plugin** - Scans your component directory and serves an API endpoint
4. **Component Browser** - React app that fetches component list and renders them
5. **Hot Reloading** - Vite watches your component directory for changes

### Publishing

To publish to npm:

```bash
npm version patch  # or minor/major
npm publish
```

### Troubleshooting

**Component not showing up?**
- Make sure your JSX file has a default export
- Check the browser console for import errors
- Verify the file is in the directory you specified

**Hot reloading not working?**
- The server automatically watches your component directory
- Try refreshing if changes aren't reflected immediately

**Port already in use?**
- Specify a different port: `leafstone components/ 3001`
- Check what's running on port 3000: `lsof -i :3000`
