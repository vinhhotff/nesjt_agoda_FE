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
import RevenueTrendChart from '@/src/components/admin/revenue/RevenueTrendChart';
import OrderStatusChart from '@/src/components/admin/revenue/OrderStatusChart';
import StatsCard from '@/src/components/admin/revenue/StatsCard';
import { AdminLayout } from '@/src/components/layout';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];



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
        () => getTopSellingItems(actualPeriod || '30d', 10, startDate, endDate),
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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 text-lg">Loading revenue analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Revenue Analytics"
          description="Track your restaurant's financial performance and insights"
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          action={
            <div className="flex gap-3 items-center">
              {/* Period Selector */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm font-medium text-sm"
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
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExportReport}
                disabled={exporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
                {exporting ? 'Exporting...' : 'Export'}
              </button>

              {/* Refresh */}
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          }
        />

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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <RevenueTrendChart data={revenueChart} />
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <OrderStatusChart data={orderAnalytics?.statusDistribution || []} />
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Selling Items */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Top Selling Items</h3>
            </div>
            <div className="space-y-4">
              {topSellingItems && topSellingItems.length > 0 ? (
                topSellingItems.map((item, index) => (
                  <div 
                    key={item?._id || index} 
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white' :
                          'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-gray-800">{item?.name || 'Unknown Item'}</h4>
                        <p className="text-sm text-gray-500">{item?.category || 'Food'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{(item?.totalSold || 0)} sold</p>
                      <p className="text-sm font-bold text-green-600">{((item?.totalRevenue || 0)).toLocaleString('vi-VN')} VND</p>
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
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-gray-700 font-medium">Total Orders</span>
                <span className="font-bold text-gray-900 text-lg">{orderAnalytics?.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <span className="text-green-700 font-medium">Completed</span>
                <span className="font-bold text-green-700 text-lg">{orderAnalytics?.completedOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <span className="text-yellow-700 font-medium">Pending</span>
                <span className="font-bold text-yellow-700 text-lg">{orderAnalytics?.pendingOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <span className="text-red-700 font-medium">Cancelled</span>
                <span className="font-bold text-red-700 text-lg">{orderAnalytics?.cancelledOrders || 0}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-4 mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Success Rate</span>
                  <span className="font-bold text-green-700 text-xl">
                    {orderAnalytics && orderAnalytics.totalOrders > 0 ? 
                      ((orderAnalytics.completedOrders / orderAnalytics.totalOrders) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Customer Analytics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{customerAnalytics?.totalCustomers || 0}</p>
              <p className="text-gray-600 font-medium">Total Customers</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{customerAnalytics?.newCustomers || 0}</p>
              <p className="text-gray-600 font-medium">New Customers</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{customerAnalytics?.returningCustomers || 0}</p>
              <p className="text-gray-600 font-medium">Returning Customers</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
