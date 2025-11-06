import React, { HTMLAttributes } from 'react';

export function Separator({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`w-full h-px bg-gray-200 ${className}`} {...props} />;
}

