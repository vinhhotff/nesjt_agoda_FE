'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Calendar } from 'lucide-react';
import { RevenueStats, RevenueChartData, TopSellingItem } from '@/src/Types';
import { getRevenueStats, getRevenueChart, getTopSellingItems, exportRevenueReport } from '@/src/lib/api/revenueApi';
import { handleApiCall, showErrorToast, showSuccessToast } from '@/src/lib/utils/errorHandling';
import RevenueSummary from './RevenueSummary';
import RevenueChart from './RevenueChart';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorState from '../../ui/ErrorState';

interface RevenueDashboardProps {
  className?: string;
  defaultPeriod?: string;
}

const RevenueDashboard: React.FC<RevenueDashboardProps> = ({
  className = '',
  defaultPeriod = '30d'
}) => {
  const [period, setPeriod] = useState(defaultPeriod);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Data states
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    growth: { revenue: 0, orders: 0 },
    periodComparison: { current: 0, previous: 0, change: 0 },
  });
  const [chartData, setChartData] = useState<RevenueChartData[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItem[]>([]);

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  // Fetch all revenue data
  const fetchRevenueData = async (selectedPeriod: string) => {
    setLoading(true);
    setError('');
    
    try {
      
      // Fetch all data in parallel
      const [stats, chart, items] = await Promise.all([
        getRevenueStats(selectedPeriod),
        getRevenueChart(selectedPeriod, 'day'),
        getTopSellingItems(selectedPeriod, 5)
      ]);
      
      
      setRevenueStats(stats);
      setChartData(chart);
      setTopItems(items);
      setLastUpdated(new Date());
      
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to fetch revenue data';
      setError(errorMessage);
      showErrorToast(err, 'Failed to load revenue dashboard');
      console.error('❌ Revenue data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRevenueData(period);
  }, [period]);

  // Refresh data
  const handleRefresh = async () => {
    await fetchRevenueData(period);
  };

  // Export revenue report
  const handleExport = async () => {
    const result = await handleApiCall(
      () => exportRevenueReport(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        'csv'
      ),
      {
        successMessage: 'Revenue report exported successfully',
        errorMessage: 'Failed to export revenue report',
        showSuccessToast: true
      }
    );

    if (result) {
      // Create download link for blob
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-report-${period}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  if (error && !loading) {
    return (
      <div className={className}>
        <ErrorState
          title="Revenue Dashboard Error"
          message={error}
          onRetry={handleRefresh}
          className="h-64"
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your revenue performance and trends
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Last updated info */}
      {lastUpdated && !loading && (
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Revenue Summary */}
      <RevenueSummary 
        stats={revenueStats}
        loading={loading}
      />

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <RevenueChart
          data={chartData}
          loading={loading}
          title="Revenue Trend"
        />

        {/* Top Selling Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h3>
          
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : topItems.length > 0 ? (
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">No img</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${item.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.totalSold} sold
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🏆</div>
              <p>No top selling items data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
