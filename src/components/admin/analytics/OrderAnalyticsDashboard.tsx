'use client';

import React, { useState, useEffect } from 'react';
import { OrderAnalytics } from '@/src/Types';
import { getOrderAnalytics } from '@/src/lib/api/analyticsApi';
import OrderSummary from './OrderSummary';
import StatusDistributionChart from './StatusDistributionChart';
import DailyOrdersChart from './DailyOrdersChart';
import LoadingSpinner from '../../ui/LoadingSpinner';
import ErrorState from '../../ui/ErrorState';

interface OrderAnalyticsDashboardProps {
  period?: string;
  className?: string;
}

const OrderAnalyticsDashboard: React.FC<OrderAnalyticsDashboardProps> = ({
  period = '30d',
  className = '',
}) => {
  const [data, setData] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getOrderAnalytics(period);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch order analytics:', err);
        setError('Failed to load order analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorState 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        No order analytics data available
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Summary Stats */}
      <OrderSummary 
        totalOrders={data.totalOrders}
        pendingOrders={data.pendingOrders}
        completedOrders={data.completedOrders}
        cancelledOrders={data.cancelledOrders}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <StatusDistributionChart 
          statusDistribution={data.statusDistribution}
        />

        {/* Daily Orders Trend */}
        <DailyOrdersChart 
          dailyOrders={data.dailyOrders}
        />
      </div>
    </div>
  );
};

export default OrderAnalyticsDashboard;
