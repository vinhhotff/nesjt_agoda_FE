import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

function Card({
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

export default Card;
export { Card };

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={className}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return <h3 className={`font-semibold text-gray-900 ${className}`}>{children}</h3>;
}
