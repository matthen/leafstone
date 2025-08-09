# Leafstone React

A CLI tool for quickly prototyping and testing individual React components with hot reloading. Just point it at a JSX file and get an instant development server!

## Installation

Install globally via npm:

```bash
npm install -g leafstone-react
```

## Usage

### Basic Usage

```bash
# Start server for a specific component file
leafstone examples/Counter.jsx

# Start server for any JSX file
leafstone ./my-components/Button.jsx

# Use custom port
leafstone ./components/MyComponent.jsx 3001
```

### Quick Start

1. **Create a JSX component**
   ```jsx
   // Counter.jsx
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

2. **Start the development server**
   ```bash
   leafstone Counter.jsx
   ```

3. **Open your browser**
   - Server opens automatically at `http://localhost:3000`
   - Your component renders immediately
   - Changes hot-reload automatically

### Features

- ✅ **Zero Configuration** - Just point at a JSX file
- ✅ **Instant Development** - Component renders immediately in the browser
- ✅ **Hot Module Replacement (HMR)** - Changes are reflected instantly
- ✅ **Tailwind CSS Support** - Built-in Tailwind with Dracula theme
- ✅ **Lucide React Icons** - Icon library available for all components
- ✅ **React DevTools Compatible** - Full React development experience

### Component Requirements

Components should:
- Be in `.jsx` files
- Export the component as default export
- Not require any props (they render in isolation)
- Use standard React patterns (hooks, state, etc.)

### Available Libraries

- **React** - Hooks, state, context, etc.
- **Tailwind CSS** - Utility-first CSS framework with Dracula theme
- **Lucide React** - Beautiful icon library (`import { Icon } from 'lucide-react'`)

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
   leafstone examples/Counter.jsx
   ```
   
   > **What is `npm link`?** This creates a global symlink to your local development version of the package. It's like temporarily installing your in-development package globally so you can test the `leafstone` command before publishing to npm. Think of it as "install this local package globally for testing".

3. **Test the CLI locally**
   ```bash
   # Test with the included example component
   leafstone examples/Counter.jsx
   
   # Test with your own component file
   # ... create a JSX file
   leafstone MyComponent.jsx
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

1. **CLI Command** - `bin/leafstone.js` processes the JSX file argument and starts server
2. **Temporary Setup** - Creates `.leafstone-temp-{unique}/` directory with Vite project files
3. **Component Aliasing** - Sets up Vite alias to import your specific component
4. **Direct Rendering** - React app imports and renders your component immediately
5. **Hot Reloading** - Vite watches your component file for changes

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
- Verify the file path is correct

**Hot reloading not working?**
- The server automatically watches your component file
- Try refreshing if changes aren't reflected immediately

**Port already in use?**
- Specify a different port: `leafstone MyComponent.jsx 3001`
- Check what's running on port 3000: `lsof -i :3000`
