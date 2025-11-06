import React, { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export function Badge({ className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}
      {...props}
    />
  );
}

