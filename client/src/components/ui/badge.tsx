import React from 'react';

export const Badge = ({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ${className}`}
  >
    {children}
  </span>
);
