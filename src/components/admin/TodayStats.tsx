'use client';

import { Package, DollarSign, Users, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';

interface TodayStatsProps {
  todayStats: {
    totalOrders?: number;
    totalRevenue?: number;
    newUsers?: number;
    completedOrders?: number;
    pendingOrders?: number;
    cancelledOrders?: number;
  };
}

const statItems = [
  {
    key: 'totalOrders',
    label: 'Orders Today',
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-700',
  },
  {
    key: 'totalRevenue',
    label: "Today's Revenue",
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    valueColor: 'text-green-700',
    isCurrency: true,
  },
  {
    key: 'newUsers',
    label: 'New Users',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    valueColor: 'text-purple-700',
  },
  {
    key: 'completedOrders',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-700',
  },
  {
    key: 'pendingOrders',
    label: 'Pending',
    icon: Clock,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-700',
  },
  {
    key: 'cancelledOrders',
    label: 'Cancelled',
    icon: XCircle,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    valueColor: 'text-red-700',
  },
];

export default function TodayStats({ todayStats }: TodayStatsProps) {
  if (!todayStats) return null;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="mt-8 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative group">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Today's Performance</h2>
          <p className="text-sm text-gray-500">Real-time statistics for today</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statItems.map((item, index) => {
          const value = todayStats[item.key as keyof typeof todayStats];
          if (value === undefined && item.key !== 'totalOrders' && item.key !== 'totalRevenue') return null;
          
          const Icon = item.icon;
          const displayValue = item.isCurrency && typeof value === 'number' 
            ? formatCurrency(value) 
            : (value || 0);
          
          return (
            <div
              key={item.key}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-gray-300 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated gradient border */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${item.color} group-hover:h-2 transition-all duration-300`}>
                <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="relative">
                    <div className={`${item.bgColor} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} animate-pulse`} />
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color} animate-pulse`} style={{ animationDelay: '0.2s' }} />
                    <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${item.color} animate-pulse`} style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
                
                <div>
                  <div className={`text-3xl font-bold ${item.valueColor} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                    {displayValue}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              </div>
              
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
