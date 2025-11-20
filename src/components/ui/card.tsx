import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-lg border border-gray-100
        transition-all duration-300
        ${hoverable ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
