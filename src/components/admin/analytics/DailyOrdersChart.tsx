'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChartDataPoint } from '@/src/Types';

interface DailyOrdersChartProps {
  dailyOrders: ChartDataPoint[];
}

const DailyOrdersChart: React.FC<DailyOrdersChartProps> = ({
  dailyOrders = [],
}) => {
  if (!dailyOrders || dailyOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Orders Trend</h3>
        <div className="text-center py-8 text-gray-500">
          No daily orders data available
        </div>
      </div>
    );
  }

  // Find the maximum value for scaling
  const maxCount = Math.max(...dailyOrders.map(item => item.count));
  const safeMaxCount = maxCount || 1; // Prevent division by zero

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Orders Trend</h3>
      
      <div className="relative">
        {/* Chart container */}
        <div className="flex items-end justify-between h-48 mb-4 space-x-2">
          {dailyOrders.map((item, index) => {
            const height = safeMaxCount > 0 ? (item.count / safeMaxCount) * 100 : 0;
            
            return (
              <div key={item.date} className="flex flex-col items-center flex-1">
                {/* Bar */}
                <div className="relative w-full flex justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full max-w-8 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors duration-200 relative group"
                    style={{ minHeight: item.count > 0 ? '4px' : '0px' }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {item.count} orders
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-800" />
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Date label */}
                <div className="mt-2 text-xs text-gray-600 text-center transform rotate-0 whitespace-nowrap">
                  {formatDate(item.date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>{safeMaxCount}</span>
          <span>{Math.round(safeMaxCount * 0.75)}</span>
          <span>{Math.round(safeMaxCount * 0.5)}</span>
          <span>{Math.round(safeMaxCount * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">
            Total ({dailyOrders.length} days)
          </span>
          <span className="text-gray-600">
            {dailyOrders.reduce((sum, item) => sum + item.count, 0).toLocaleString()} orders
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="font-medium text-gray-700">Average per day</span>
          <span className="text-gray-600">
            {Math.round(
              dailyOrders.reduce((sum, item) => sum + item.count, 0) / dailyOrders.length
            ).toLocaleString()} orders
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyOrdersChart;
