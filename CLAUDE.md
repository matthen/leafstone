# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leafstone React is a CLI tool for rapidly prototyping React components. It provides zero-configuration development and build capabilities for individual JSX components with hot reloading, automatic dependency installation, and static build generation.

## Key Commands

### Development
```bash
# Start development server
npm run dev                    # Runs the dev-server with Vite config
leafstone examples/Counter.jsx # Test CLI with example component
leafstone MyComponent.jsx 3001 # Custom port

# Local development setup
npm link                       # Create global symlink for testing CLI
```

### Build and Test
```bash
# Build static files
leafstone --build ./dist MyComponent.jsx
leafstone -b ./output Chart.jsx

# Testing (no automated tests configured)
npm test                       # Currently returns "no test specified" error
```

## Architecture

### Core Components

**CLI Entry (`bin/leafstone.js`)**
- Uses yargs for command parsing
- Validates JSX file existence and extension
- Passes arguments to server module

**Server Engine (`lib/server.js`)**
- **Temporary Project Setup**: Creates `.leafstone-temp-{unique}/` directory with complete Vite project
- **Dependency Detection**: Parses `// @requires package@version` comments in JSX files
- **Dynamic Installation**: Auto-installs npm packages using detected dependencies
- **Asset Management**: Handles `// @requires-asset path` for static files
- **Component Aliasing**: Copies user's JSX component into temp project structure
- **Hot Reloading**: Watches original component file and updates temp copy

**Plugin System (`lib/plugin.js`)**
- Minimal Vite plugin (currently empty as temp directory approach handles component resolution)

### Dependency System

Components can declare external packages via JSDoc-style comments:
```jsx
// @requires recharts@^2.8.0
// @requires lodash@^4.17.0
// @requires-asset ./logo.png
```

The server automatically:
1. Parses these comments
2. Creates package.json with discovered dependencies
3. Runs `npm install` in temp directory
4. Copies assets to accessible locations

### Template System

Located in `templates/`:
- `index.html` - HTML shell with component name templating
- `main.jsx` - React bootstrap that imports user component
- `styles.css` - Base Tailwind CSS imports

Built-in styling stack:
- Tailwind CSS with Dracula theme
- Lucide React icons
- PostCSS with Autoprefixer

### Build Process

**Development Mode**: 
- Creates temp Vite project
- Runs dev server with HMR
- Watches original component file
- Cleans up temp directory on exit

**Build Mode**:
- Same temp project setup
- Runs Vite build to specified output directory
- Copies assets to build output
- Removes temp directory after completion

## File Structure

```
leafstone-react/
├── bin/leafstone.js           # CLI entry point
├── lib/
│   ├── server.js              # Core server logic
│   ├── plugin.js              # Vite plugin
│   └── index.js               # Module exports
├── templates/                 # Project templates for temp directory
├── examples/                  # Example JSX components for testing
└── dev-server/               # Development Vite config
```

## Development Notes

- **Temp Directory Strategy**: Each session creates unique `.leafstone-temp-{timestamp}` directory to avoid conflicts
- **Node Modules Copying**: Essential packages (react, react-dom, lucide-react) copied from main node_modules before custom dependency installation
- **File Watching**: Uses Node.js `fs.watchFile` to monitor original component and sync changes to temp copy
- **Permission Handling**: Explicitly sets file permissions (0o755 for dirs, 0o644 for files) to avoid issues across systems