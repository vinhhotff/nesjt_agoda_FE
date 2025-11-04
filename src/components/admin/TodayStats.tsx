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
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    valueColor: 'text-yellow-700',
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Today's Performance</h2>
          <p className="text-sm text-gray-500">Real-time statistics for today</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statItems.map((item) => {
          const value = todayStats[item.key as keyof typeof todayStats];
          if (value === undefined && item.key !== 'totalOrders' && item.key !== 'totalRevenue') return null;
          
          const Icon = item.icon;
          const displayValue = item.isCurrency && typeof value === 'number' 
            ? formatCurrency(value) 
            : (value || 0);
          
          return (
            <div
              key={item.key}
              className="group relative overflow-hidden bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${item.bgColor} rounded-lg p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color}`} />
                  </div>
                </div>
                
                <div className="mb-1">
                  <div className={`text-2xl font-bold ${item.valueColor} mb-1`}>
                    {displayValue}
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {item.label}
                  </div>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
