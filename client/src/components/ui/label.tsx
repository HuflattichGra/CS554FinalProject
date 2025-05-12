import React from 'react';
import './Label.css';

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', ...props }) => (
  <label
    className={`form-label ${className}`}
    {...props}
  />
);

export { Label };
