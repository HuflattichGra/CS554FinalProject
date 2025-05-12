import React from 'react';
import './Textarea.css';
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`custom-textarea ${className}`}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
export { Textarea };
