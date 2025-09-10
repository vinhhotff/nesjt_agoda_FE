"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';

import { 
  RevenueStats, 
  RevenueChartData, 
  TopSellingItem, 
  OrderAnalytics, 
  CustomerAnalytics 
} from '@/src/Types';
import { 
  getRevenueStats, 
  getRevenueChart, 
  getTopSellingItems, 
  getOrderAnalytics, 
  getCustomerAnalytics,
  exportRevenueReport 
} from '@/src/lib/api';

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'purple';
  suffix?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue',
  suffix = '' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    yellow: 'bg-yellow-500 text-yellow-100',
    purple: 'bg-purple-500 text-purple-100',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <p className={`text-sm font-medium flex items-center mt-2 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface ChartPlaceholderProps {
  title: string;
  data: any[];
  height?: number;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, data, height = 300 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div 
        className="bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Chart visualization would go here</p>
          <p className="text-gray-400 text-sm mt-1">
            {data.length} data points available
          </p>
        </div>
      </div>
    </div>
  );
};

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    
    const startDate = period === 'custom' ? customDateRange.startDate : undefined;
    const endDate = period === 'custom' ? customDateRange.endDate : undefined;
    const actualPeriod = period === 'custom' ? undefined : period;
    
    // Fetch each API independently to prevent one failure from breaking everything
const fetchWithFallback = async <T,>(apiCall: () => Promise<T>, defaultValue: T, name: string): Promise<T> => {
      try {
        const result = await apiCall();
        return result;
      } catch (error: any) {
        console.warn(`🚨 ${name} API failed, using fallback:`, (error as any)?.message || error);
        return defaultValue;
      }
    };
    
    // Fetch all data independently
    const [
      revenueStatsData,
      revenueChartData,
      topItemsData,
      orderAnalyticsData,
      customerAnalyticsData,
    ] = await Promise.all([
      fetchWithFallback(
        () => getRevenueStats(actualPeriod, startDate, endDate),
        null,
        'Revenue Stats'
      ),
      fetchWithFallback(
        () => getRevenueChart(actualPeriod || '30d'),
        [],
        'Revenue Chart'
      ),
      fetchWithFallback(
        () => getTopSellingItems(actualPeriod || '30d', 10),
        [],
        'Top Selling Items'
      ),
      fetchWithFallback(
        () => getOrderAnalytics(actualPeriod || '30d'),
        null,
        'Order Analytics'
      ),
      fetchWithFallback(
        () => getCustomerAnalytics(actualPeriod || '30d'),
        null,
        'Customer Analytics'
      ),
    ]);

    // Set data - null values will be handled gracefully by UI
    setRevenueStats(revenueStatsData);
    setRevenueChart(revenueChartData);
    setTopSellingItems(topItemsData);
    setOrderAnalytics(orderAnalyticsData);
    setCustomerAnalytics(customerAnalyticsData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [period, customDateRange]);

  const handleExportReport = async () => {
    try {
      setExporting(true);
      const startDate = period === 'custom' ? customDateRange.startDate : 
                       new Date(Date.now() - (period === '7d' ? 7 : period === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = period === 'custom' ? customDateRange.endDate : 
                     new Date().toISOString().split('T')[0];

      const blob = await exportRevenueReport(startDate, endDate, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !revenueStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue Analytics</h1>
            <p className="text-gray-600">Track your restaurant's financial performance</p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Period Selector */}
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PERIOD_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Custom Date Range */}
            {period === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExportReport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export'}
            </button>

            {/* Refresh */}
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Revenue"
            value={revenueStats?.totalRevenue || 0}
            change={revenueStats?.growth.revenue}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
            suffix=" VND"
          />
          <StatsCard
            title="Total Orders"
            value={revenueStats?.totalOrders || 0}
            change={revenueStats?.growth.orders}
            icon={<ShoppingCart className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Average Order Value"
            value={revenueStats?.averageOrderValue || 0}
            icon={<Target className="w-6 h-6" />}
            color="purple"
            suffix=" VND"
          />
          <StatsCard
            title="Total Customers"
            value={customerAnalytics?.totalCustomers || 0}
            change={customerAnalytics?.customerGrowth.change}
            icon={<Users className="w-6 h-6" />}
            color="yellow"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartPlaceholder
            title="Revenue Trend"
            data={revenueChart}
            height={350}
          />
          <ChartPlaceholder
            title="Order Status Distribution"
            data={orderAnalytics?.statusDistribution || []}
            height={350}
          />
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Selling Items */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h3>
            <div className="space-y-4">
              {topSellingItems.length > 0 ? (
                topSellingItems.map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{item.totalSold} sold</p>
                      <p className="text-sm text-green-600">{item.totalRevenue.toLocaleString()} VND</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No top selling items data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Analytics Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium">{orderAnalytics?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium text-green-600">{orderAnalytics?.completedOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">{orderAnalytics?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cancelled</span>
                <span className="font-medium text-red-600">{orderAnalytics?.cancelledOrders || 0}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">
                    {orderAnalytics ? 
                      ((orderAnalytics.completedOrders / orderAnalytics.totalOrders) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{customerAnalytics?.totalCustomers || 0}</p>
              <p className="text-gray-600">Total Customers</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <Activity className="w-8 h-8" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{customerAnalytics?.newCustomers || 0}</p>
              <p className="text-gray-600">New Customers</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                <Target className="w-8 h-8" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{customerAnalytics?.returningCustomers || 0}</p>
              <p className="text-gray-600">Returning Customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
