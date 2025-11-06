'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RevenueChartData, ChartDataPoint } from '@/src/Types';

interface RevenueChartProps {
  data: RevenueChartData[];
  loading?: boolean;
  title?: string;
  className?: string;
}

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  title: string;
  loading?: boolean;
}

// Simple bar chart component for revenue visualization
const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  title, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No chart data available</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.count));
  const safeMaxValue = maxValue || 1;

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

  const formatValue = (value: number) => {
    if (title.toLowerCase().includes('revenue')) {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="relative">
        <div className="flex items-end justify-between h-48 mb-4 space-x-1">
          {data.map((item, index) => {
            const height = safeMaxValue > 0 ? (item.count / safeMaxValue) * 100 : 0;
            
            return (
              <div key={item.date} className="flex flex-col items-center flex-1">
                <div className="relative w-full flex justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full max-w-8 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors duration-200 relative group"
                    style={{ minHeight: item.count > 0 ? '4px' : '0px' }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {formatValue(item.count)}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-800" />
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="mt-2 text-xs text-gray-600 text-center whitespace-nowrap">
                  {formatDate(item.date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{formatValue(safeMaxValue)}</span>
          <span>{formatValue(Math.round(safeMaxValue * 0.75))}</span>
          <span>{formatValue(Math.round(safeMaxValue * 0.5))}</span>
          <span>{formatValue(Math.round(safeMaxValue * 0.25))}</span>
          <span>$0</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total:</span>
            <div className="font-semibold">
              {formatValue(data.reduce((sum, item) => sum + item.count, 0))}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Average:</span>
            <div className="font-semibold">
              {formatValue(Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length))}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Period:</span>
            <div className="font-semibold">
              {data.length} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RevenueChart: React.FC<RevenueChartProps> = ({ 
  data, 
  loading = false,
  title = 'Revenue Trend',
  className = '' 
}) => {
  // Convert RevenueChartData[] to ChartDataPoint[] for consistent chart display
  const chartData: ChartDataPoint[] = data.map(item => ({
    date: item.date,
    count: item.revenue // Using revenue as count for chart visualization
  }));

  return (
    <div className={className}>
      <SimpleBarChart 
        data={chartData}
        title={title}
        loading={loading}
      />
    </div>
  );
};

export default RevenueChart;
