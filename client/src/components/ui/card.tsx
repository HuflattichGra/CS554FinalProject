import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <div className={`border rounded-lg shadow-sm p-4 bg-white ${className}`} {...props}>
    {children}
  </div>
);

export { Card };
