'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface StatusDistributionChartProps {
  statusDistribution: StatusDistribution[];
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  statusDistribution = [],
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'served':
        return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' };
      case 'pending':
        return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' };
      case 'preparing':
        return { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' };
      case 'cancelled':
        return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' };
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'served':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'preparing':
        return 'Preparing';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (!statusDistribution || statusDistribution.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
        <div className="text-center py-8 text-gray-500">
          No status distribution data available
        </div>
      </div>
    );
  }

  const total = statusDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
      
      <div className="space-y-4">
        {statusDistribution.map((item, index) => {
          const colors = getStatusColor(item.status);
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          
          return (
            <motion.div
              key={item.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center flex-1">
                <div className={`w-4 h-4 rounded-full ${colors.bg} mr-3`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusDisplayName(item.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      className={`h-2 rounded-full ${colors.bg}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Total Orders</span>
          <span className="text-gray-600">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusDistributionChart;
