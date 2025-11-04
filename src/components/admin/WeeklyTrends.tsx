'use client';

import { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface WeeklyTrendsData {
  day: string;
  orders: number;
  payments: number;
  revenue?: number;
}

interface WeeklyTrendsProps {
  data: WeeklyTrendsData[];
}

const WeeklyTrends: FC<WeeklyTrendsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Weekly Trends</h2>
            <p className="text-sm text-gray-500">Order and revenue trends over the week</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No trend data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 mb-2 pb-2 border-b">{`${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {entry.name}: <span className="font-bold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Trends</h2>
          <p className="text-sm text-gray-500">Order and revenue trends over the week</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              name="Orders"
              fill="url(#colorOrders)"
            />
            <Line 
              type="monotone" 
              dataKey="payments" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
              name="Payments"
              fill="url(#colorPayments)"
            />
            {data[0]?.revenue !== undefined && (
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                name="Revenue"
                fill="url(#colorRevenue)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyTrends;
