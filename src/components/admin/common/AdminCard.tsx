import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: boolean;
}

export default function AdminCard({
  children,
  title,
  subtitle,
  icon,
  action,
  className = '',
  hoverable = true,
  gradient = false,
}: AdminCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/80 backdrop-blur-sm
        rounded-3xl shadow-lg border border-gray-200/50
        transition-all duration-300
        ${hoverable ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-orange-400/5 to-transparent pointer-events-none" />
      )}

      {/* Header */}
      {(title || icon || action) && (
        <div className="relative border-b border-gray-200/50 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {icon && (
                <div className="relative group">
                  <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                </div>
              )}
              
              {(title || subtitle) && (
                <div className="flex-1 min-w-0">
                  {title && (
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative p-6">
        {children}
      </div>

      {/* Shine effect */}
      {hoverable && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      )}
    </div>
  );
}
