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
    <div className={`relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-8 ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 via-orange-400/5 to-amber-400/5 animate-gradient-x" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-400/10 via-orange-400/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400/10 via-purple-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-start gap-5">
          {/* Icon with glow effect */}
          <div className="flex-shrink-0 relative group">
            {icon ? (
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                {icon}
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            )}
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          </div>
          
          {/* Title and Description */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {action && (
          <div className="flex-shrink-0 relative z-10">
            {action}
          </div>
        )}
      </div>
      
      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60">
        <div className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 animate-shimmer" />
      </div>
    </div>
  );
}
