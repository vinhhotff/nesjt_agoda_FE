"use client";
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface OrderStatusChartProps {
  data: StatusDistribution[];
}

const COLORS: Record<string, string> = {
  pending: '#eab308',
  completed: '#10b981',
  cancelled: '#ef4444',
  processing: '#3b82f6',
  delivered: '#8b5cf6',
};

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
        <div className="bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300" style={{ height: 350 }}>
          <div className="text-center">
            <p className="text-gray-500">No order status data available</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }: any) => `${name}: ${(percentage as number).toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[data[index].status.toLowerCase()] || '#94a3b8'} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value} orders (${props.payload.percentage.toFixed(1)}%)`,
              name
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderStatusChart;

