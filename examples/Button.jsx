import { useState } from 'react';

function Button() {
  const [clicked, setClicked] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setClicked(true);
    setCount(count + 1);
    setTimeout(() => setClicked(false), 200);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Interactive Button Component</h1>
      <button
        onClick={handleClick}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: clicked ? '#45a049' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          transform: clicked ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.1s ease'
        }}
      >
        {clicked ? 'Clicked!' : 'Click me!'}
      </button>
      <p>Button clicked {count} times</p>
    </div>
  );
}

export default Button;