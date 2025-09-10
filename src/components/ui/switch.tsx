import React, { InputHTMLAttributes, forwardRef } from 'react';

interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className = '', ...props }, ref) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
      <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors relative">
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
});

Switch.displayName = 'Switch';

