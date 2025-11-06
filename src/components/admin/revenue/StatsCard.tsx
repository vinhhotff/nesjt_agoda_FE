import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue',
  suffix = '' 
}) => {
  const colorConfig = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
    },
    green: {
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-700',
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-700',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-700',
    },
  };

  const config = colorConfig[color];

  return (
    <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-1">
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`${config.iconBg} rounded-lg p-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <div className={config.iconColor}>
              {icon}
            </div>
          </div>
          
          {/* Change indicator */}
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="mb-2">
          <p className={`text-3xl font-bold ${config.valueColor} mb-1`}>
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}{suffix}
          </p>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
    </div>
  );
};

export default StatsCard;

