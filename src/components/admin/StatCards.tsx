import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  href: string;
  color: string;
}

const colorVariants: Record<string, { gradient: string; iconBg: string; iconColor: string; hover: string }> = {
  'bg-orange-100 text-orange-700': {
    gradient: 'from-orange-500 via-orange-600 to-red-500',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hover: 'hover:from-orange-600 hover:via-orange-700 hover:to-red-600'
  },
  'bg-blue-100 text-blue-700': {
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hover: 'hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700'
  },
  'bg-green-100 text-green-700': {
    gradient: 'from-green-500 via-emerald-600 to-teal-600',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hover: 'hover:from-green-600 hover:via-emerald-700 hover:to-teal-700'
  },
  'bg-purple-100 text-purple-700': {
    gradient: 'from-purple-500 via-purple-600 to-pink-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    hover: 'hover:from-purple-600 hover:via-purple-700 hover:to-pink-700'
  },
};

export default function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const variant = colorVariants[stat.color] || colorVariants['bg-blue-100 text-blue-700'];
        
        return (
          <Link href={stat.href} key={stat.label} className="group block">
            <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              {/* Gradient background overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${variant.gradient} ${variant.hover} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  {/* Icon */}
                  <div className={`${variant.iconBg} rounded-xl p-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  
                  {/* Trending indicator */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <TrendingUp className={`w-5 h-5 ${variant.iconColor}`} />
                  </div>
                </div>
                
                {/* Value */}
                <div className="mb-2">
                  <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
                
                {/* View link */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">
                    View Details
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
