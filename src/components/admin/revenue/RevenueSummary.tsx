'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Target, Users } from 'lucide-react';
import { RevenueStats } from '@/src/Types';

interface RevenueSummaryProps {
  stats: RevenueStats;
  loading?: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  index: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  bgColor, 
  index,
  loading = false
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('value')) {
        return `$${val.toLocaleString()}`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = (changeVal?: number) => {
    if (changeVal === undefined) return 'text-gray-500';
    return changeVal >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (changeVal?: number) => {
    if (changeVal === undefined) return null;
    return changeVal >= 0 ? TrendingUp : TrendingDown;
  };

  const ChangeIcon = getChangeIcon(change);

  if (loading) {
    return (
      <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className={`h-8 w-8 ${color.replace('text-', 'bg-').replace('-600', '-200')} rounded-full`}></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className={`text-2xl font-bold ${color}`}>
          {formatValue(value)}
        </p>
        
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${getChangeColor(change)}`}>
            {ChangeIcon && <ChangeIcon className="h-3 w-3" />}
            <span className="text-xs font-medium">
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RevenueSummary: React.FC<RevenueSummaryProps> = ({ 
  stats, 
  loading = false,
  className = '' 
}) => {
  const cards = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      change: stats.growth.revenue,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-white',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      change: stats.growth.orders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-white',
    },
    {
      title: 'Average Order Value',
      value: stats.averageOrderValue,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-white',
    },
    {
      title: 'Period Comparison',
      value: `$${stats.periodComparison.current.toLocaleString()}`,
      change: stats.periodComparison.change,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-white',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Revenue Overview</h2>
        {!loading && (
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
            index={index}
            loading={loading}
          />
        ))}
      </div>
      
      {/* Period Comparison Details */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3">Period Comparison Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current Period:</span>
              <div className="font-semibold text-gray-900">
                ${stats.periodComparison.current.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Previous Period:</span>
              <div className="font-semibold text-gray-900">
                ${stats.periodComparison.previous.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Change:</span>
              <div className={`font-semibold ${
                stats.periodComparison.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.periodComparison.change > 0 ? '+' : ''}
                {stats.periodComparison.change.toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RevenueSummary;
