import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';

// Create root once
const root = createRoot(document.getElementById('root'));

async function loadComponent() {
  const componentName = window.location.hash.slice(1);
  
  // If no hash, show component list
  if (!componentName) {
    try {
      const response = await fetch('/api/components');
      const { components, directory } = await response.json();
      
      const componentItems = components.map(name => 
        React.createElement('li', { key: name, className: 'mb-3' },
          React.createElement('a', { 
            href: `#${name}`, 
            className: 'block p-4 bg-gray-800 hover:bg-gray-700 text-gray-100 no-underline rounded-lg border border-gray-600 transition-colors duration-200'
          }, `📦 ${name}`)
        )
      );

      const componentList = React.createElement('div', { className: 'p-6 font-sans max-w-4xl mx-auto' },
        React.createElement('h1', { className: 'text-3xl font-bold text-white mb-2' }, 'Leafstone React Component Viewer'),
        React.createElement('p', { className: 'text-gray-400 mb-6' }, `Found ${components.length} component${components.length !== 1 ? 's' : ''} in ${directory}:`),
        React.createElement('ul', { className: 'list-none p-0' }, ...componentItems)
      );
      
      root.render(componentList);
    } catch (error) {
      root.render(React.createElement('div', { className: 'p-6 max-w-4xl mx-auto' },
        React.createElement('h1', { className: 'text-2xl font-bold text-red-400 mb-2' }, 'Error loading components'),
        React.createElement('p', { className: 'text-gray-400' }, 'Could not fetch component list from server')
      ));
    }
    return;
  }
  
  try {
    const module = await import(`@components/${componentName}.jsx`);
    const Component = module.default;
    
    root.render(React.createElement(Component));
  } catch (error) {
    root.render(React.createElement('div', { className: 'p-6 max-w-4xl mx-auto' }, 
      React.createElement('h1', { className: 'text-2xl font-bold text-red-400 mb-2' }, `Component "${componentName}" not found`),
      React.createElement('p', { className: 'text-gray-400 mb-4' }, 'Available components in your directory'),
      React.createElement('a', { href: '#', className: 'text-purple-400 hover:text-pink-400 underline' }, 'Back to component list')
    ));
  }
}

loadComponent();

// Listen for hash changes to load different components
window.addEventListener('hashchange', loadComponent);
