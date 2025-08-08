import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { jsxDevServerPlugin } from './plugin.js';

export default defineConfig({
  plugins: [
    react(), 
    jsxDevServerPlugin()
  ],
  server: {
    port: 3000,
    open: false,
    watch: {
      include: ['examples/**/*.jsx']
    }
  },
  root: process.cwd(),
});