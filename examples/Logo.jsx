// @requires-asset ./logo.svg
import { Sparkles, Code, Zap } from 'lucide-react';

function Logo() {
  return (
    <div className="max-w-lg mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold text-white">
            Component Showcase
          </h2>
          <Sparkles className="text-purple-400" size={24} />
        </div>
        
        <p className="text-gray-400 mb-6">
          Demonstrating asset loading with JSDoc syntax
        </p>
      </div>
      
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
        <div className="flex justify-center">
          <img 
            src="/assets/logo.svg" 
            alt="Leafstone React Logo" 
            className="w-48 h-48 object-contain"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Code className="text-purple-400" size={20} />
            <span className="text-purple-300 font-medium">Syntax</span>
          </div>
          <p className="text-white text-sm font-mono">
            // @requires-asset
          </p>
          <p className="text-purple-400 text-xs mt-1">
            JSDoc comment declares assets
          </p>
        </div>
        
        <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-green-400" size={20} />
            <span className="text-green-300 font-medium">Result</span>
          </div>
          <p className="text-white text-sm font-mono">
            /assets/logo.svg
          </p>
          <p className="text-green-400 text-xs mt-1">
            Available at predictable URL
          </p>
        </div>
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-2">How it works:</h3>
        <ol className="text-gray-300 text-sm space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">1.</span>
            <span>Declare asset with <code className="text-purple-400">// @requires-asset ./logo.svg</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">2.</span>
            <span>Leafstone copies it to <code className="text-green-400">/assets/</code> directory</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Reference in JSX as <code className="text-blue-400">src="/assets/logo.svg"</code></span>
          </li>
        </ol>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          🎨 Single-file component with embedded assets
        </p>
      </div>
    </div>
  );
}

export default Logo;