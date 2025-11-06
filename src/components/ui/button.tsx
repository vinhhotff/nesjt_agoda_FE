import React, { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-gray-300 text-gray-800 hover:bg-gray-100',
  ghost: 'text-gray-800 hover:bg-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'default', className = '', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={`px-4 py-2 rounded-lg transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
});

Button.displayName = 'Button';

