import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">
        Counter: <span className="text-green-400">{count}</span>
      </h2>
      <button 
        onClick={increment}
        className="w-full px-6 py-3 bg-purple-500 hover:bg-pink-500 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95"
      >
        Increment ✨
      </button>
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Click the button to increment the counter!
        </p>
      </div>
    </div>
  );
}

export default Counter;
