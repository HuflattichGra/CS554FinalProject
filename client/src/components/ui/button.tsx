import React from 'react';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition ${className}`}
    {...props}
  />
);

export { Button };
