import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search';
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', error = false, className = '', ...props }, ref) => {
    const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors";
    
    const variantClasses = {
      default: error 
        ? "border-red-300 bg-red-50" 
        : "border-gray-300 bg-white",
      search: "border-gray-600 bg-gray-800 text-white placeholder-gray-400"
    };

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
