import React from 'react';
import './Button.css';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...props }) => (
  <button
    className={`btn ${className}`}
    {...props}
  />
);

export { Button };
