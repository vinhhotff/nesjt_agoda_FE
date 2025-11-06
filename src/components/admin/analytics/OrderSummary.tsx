'use client';

import React from 'react';
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderSummaryProps {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  index 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalOrders,
  pendingOrders,
  completedOrders,
  cancelledOrders,
}) => {
  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-white',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-white',
    },
    {
      title: 'Completed Orders',
      value: completedOrders,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-white',
    },
    {
      title: 'Cancelled Orders',
      value: cancelledOrders,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          bgColor={stat.bgColor}
          index={index}
        />
      ))}
    </div>
  );
};

export default OrderSummary;
