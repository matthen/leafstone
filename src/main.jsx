import React from 'react';
import { createRoot } from 'react-dom/client';

// Create root once
const root = createRoot(document.getElementById('root'));

async function loadComponent() {
  const componentName = window.location.hash.slice(1);
  
  // If no hash, show component list
  if (!componentName) {
    try {
      const response = await fetch('/api/components');
      const { components } = await response.json();
      
      const componentItems = components.map(name => 
        React.createElement('li', { key: name, style: { margin: '10px 0' } },
          React.createElement('a', { 
            href: `#${name}`, 
            style: { 
              display: 'block',
              padding: '10px 15px',
              backgroundColor: '#f0f0f0',
              textDecoration: 'none',
              borderRadius: '5px',
              color: '#333',
              border: '1px solid #ddd'
            }
          }, `📦 ${name}`)
        )
      );

      const componentList = React.createElement('div', { style: { padding: '20px', fontFamily: 'Arial, sans-serif' } },
        React.createElement('h1', {}, 'Available Components'),
        React.createElement('p', {}, `Found ${components.length} component${components.length !== 1 ? 's' : ''} in examples/ directory:`),
        React.createElement('ul', { style: { listStyle: 'none', padding: 0 } }, ...componentItems)
      );
      
      root.render(componentList);
    } catch (error) {
      root.render(React.createElement('div', { style: { padding: '20px' } },
        React.createElement('h1', {}, 'Error loading components'),
        React.createElement('p', {}, 'Could not fetch component list from server')
      ));
    }
    return;
  }
  
  try {
    const module = await import(`../examples/${componentName}.jsx`);
    const Component = module.default;
    
    root.render(React.createElement(Component));
  } catch (error) {
    root.render(React.createElement('div', {}, 
      React.createElement('h1', {}, `Component "${componentName}" not found`),
      React.createElement('p', {}, 'Available components in examples/ directory'),
      React.createElement('a', { href: '#' }, 'Back to component list')
    ));
  }
}

loadComponent();

// Listen for hash changes to load different components
window.addEventListener('hashchange', loadComponent);