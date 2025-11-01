"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RevenueChartData } from '@/src/Types';

interface RevenueTrendChartProps {
  data: RevenueChartData[];
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
        <div className="bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300" style={{ height: 350 }}>
          <div className="text-center">
            <p className="text-gray-500">No revenue data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'revenue') {
                return [`${value.toLocaleString()} VND`, 'Revenue'];
              }
              return [value, 'Orders'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Revenue"
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="orders" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Orders"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart;

