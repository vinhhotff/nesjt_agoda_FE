import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  action,
  className = "",
  icon
}: AdminPageHeaderProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 ${className}`}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            {icon || (
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          
          {/* Title and Description */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      
      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
    </div>
  );
}
