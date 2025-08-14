import { useState } from 'react';
import { Plus, Minus, RotateCcw, TrendingUp } from 'lucide-react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  const reset = () => {
    setCount(0);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <div className="flex items-center justify-center gap-2 mb-6">
        <TrendingUp className="text-gray-300" size={32} />
        <h2 className="text-3xl font-bold text-gray-200">
          Counter: <span className="text-white">{count}</span>
        </h2>
      </div>
      
      <div className="flex gap-3 mb-6">
        <button 
          onClick={decrement}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          <Minus size={18} />
          Decrement
        </button>
        
        <button 
          onClick={increment}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Increment
        </button>
      </div>
      
      <button 
        onClick={reset}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-all duration-200"
      >
        <RotateCcw size={16} />
        Reset
      </button>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Test component with Lucide React icons!
        </p>
      </div>
    </div>
  );
}

export default Counter;
