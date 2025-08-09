import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles.css';

// Create root once
const root = createRoot(document.getElementById('root'));

async function loadComponent() {
  try {
    // Import and render the component
    const module = await import('@component');
    const Component = module.default;
    
    root.render(React.createElement(Component));
  } catch (error) {
    root.render(React.createElement('div', { className: 'p-6 max-w-4xl mx-auto' }, 
      React.createElement('h1', { className: 'text-2xl font-bold text-red-400 mb-2' }, 'Error loading component'),
      React.createElement('p', { className: 'text-gray-400' }, `Could not load the component: ${error.message}`)
    ));
  }
}

loadComponent();
