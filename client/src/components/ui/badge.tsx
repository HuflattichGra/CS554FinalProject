import React from 'react';
import './Badge.css';
export const Badge = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`badge ${className}`}
  >
    {children}
  </span>
);
