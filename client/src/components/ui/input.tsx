import React from 'react';
import './Input.css';
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`custom-input ${className}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';
export { Input };
