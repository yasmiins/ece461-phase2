// ButtonComponent.js
import React, { useState } from 'react';
import './ButtonComponent.css';

const TopButton = ({ onClick, children }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onClick && onClick(); // Call the provided onClick callback, if any
  };

  return (
    <button
      className={`topButton ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

const LargeButton = ({ onClick, children }) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
    onClick && onClick(); // Call the provided onClick callback, if any
  };

  return (
    <button
      className={`largeButton ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export { TopButton, LargeButton };


