import { api } from './callApi';
import { RevenueStats, RevenueChartData, TopSellingItem, ChartDataPoint } from '@/src/Types';
import { handleApiCall, showErrorToast } from '../utils/errorHandling';
import { ensureChartDataPoints, normalizeApiResponse } from '../utils/fetchWithFallback';

// Get revenue statistics
export const getRevenueStats = async (
  period: string = '30d',
  startDate?: string,
  endDate?: string
): Promise<RevenueStats> => {
  return await handleApiCall(
    async () => {
      const params = new URLSearchParams();
      if (period && period !== 'custom') params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      
      const response = await api.get(`/analytics/revenue/stats?${params.toString()}`);
      const data = normalizeApiResponse(response.data, 'data');
      
      return {
        totalRevenue: data?.totalRevenue ?? data?.total_revenue ?? 0,
        totalOrders: data?.totalOrders ?? data?.total_orders ?? 0,
        averageOrderValue: data?.averageOrderValue ?? data?.average_order_value ?? 0,
        growth: {
          revenue: data?.growth?.revenue ?? data?.revenue_growth ?? 0,
          orders: data?.growth?.orders ?? data?.orders_growth ?? 0,
        },
        periodComparison: {
          current: data?.periodComparison?.current ?? data?.current_period ?? 0,
          previous: data?.periodComparison?.previous ?? data?.previous_period ?? 0,
          change: data?.periodComparison?.change ?? data?.period_change ?? 0,
        },
      } as RevenueStats;
    },
    {
      errorMessage: 'Failed to fetch revenue statistics',
      showErrorToast: false // Handle manually for better UX
    }
  ) || getDefaultRevenueStats();
};

// Get revenue chart data
export const getRevenueChart = async (
  period: string = '7d',
  groupBy: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
): Promise<RevenueChartData[]> => {
  return await handleApiCall(
    async () => {
      const params = new URLSearchParams();
      if (period && period !== 'custom') params.append('period', period);
      params.append('groupBy', groupBy);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      
      const response = await api.get(`/analytics/revenue/chart?${params.toString()}`);
      const data = normalizeApiResponse(response.data, 'data');
      
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          date: item.date || item._id || '',
          revenue: item.revenue || item.totalRevenue || item.total_revenue || 0,
          orders: item.orders || item.orderCount || item.order_count || 0,
        }));
      }
      
      return [];
    },
    {
      errorMessage: 'Failed to fetch revenue chart data',
      showErrorToast: false
    }
  ) || [];
};

// Get top selling items
export const getTopSellingItems = async (
  period: string = '30d',
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<TopSellingItem[]> => {
  return await handleApiCall(
    async () => {
      const params = new URLSearchParams();
      if (period && period !== 'custom') params.append('period', period);
      params.append('limit', String(limit));
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      
      const response = await api.get(`/analytics/menu-items/top-selling?${params.toString()}`);
      const data = normalizeApiResponse(response.data, 'data');
      
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          _id: item._id || item.menuItem?._id || '',
          name: item.name || item.menuItem?.name || 'Unknown Item',
          category: item.category || item.menuItem?.category || 'Food',
          totalSold: item.totalSold || item.total_sold || item.quantitySold || 0,
          totalRevenue: item.totalRevenue || item.total_revenue || item.revenue || 0,
          image: item.image || item.menuItem?.images?.[0] || item.menuItem?.image,
        }));
      }
      
      return [];
    },
    {
      errorMessage: 'Failed to fetch top selling items',
      showErrorToast: false
    }
  ) || [];
};

// Get order analytics with proper ChartDataPoint handling
export const getOrderAnalytics = async (
  period: string = '30d',
  startDate?: string,
  endDate?: string
) => {
  return await handleApiCall(
    async () => {
      const params = new URLSearchParams();
      if (period && period !== 'custom') params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      
      const response = await api.get(`/analytics/orders/stats?${params.toString()}`);
      const data = normalizeApiResponse(response.data, 'data');
      
      // ✅ FIXED: Ensure dailyOrders uses ChartDataPoint[] format
      const rawDailyOrders = data?.dailyOrders || data?.daily_orders || [];
      const dailyOrders: ChartDataPoint[] = ensureChartDataPoints(rawDailyOrders);
      
      
      return {
        totalOrders: data?.totalOrders ?? data?.total_orders ?? 0,
        pendingOrders: data?.pendingOrders ?? data?.pending_orders ?? 0,
        completedOrders: data?.completedOrders ?? data?.completed_orders ?? 0,
        cancelledOrders: data?.cancelledOrders ?? data?.cancelled_orders ?? 0,
        statusDistribution: data?.statusDistribution ?? data?.status_distribution ?? [],
        dailyOrders, // ✅ Now properly typed as ChartDataPoint[]
      };
    },
    {
      errorMessage: 'Failed to fetch order analytics',
      showErrorToast: false
    }
  ) || getDefaultOrderAnalytics();
};

// Get customer analytics
export const getCustomerAnalytics = async (
  period: string = '30d',
  startDate?: string,
  endDate?: string
) => {
  return await handleApiCall(
    async () => {
      const params = new URLSearchParams();
      if (period && period !== 'custom') params.append('period', period);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      
      const response = await api.get(`/analytics/customers/stats?${params.toString()}`);
      const data = normalizeApiResponse(response.data, 'data');
      
      return {
        totalCustomers: data?.totalCustomers ?? data?.total_customers ?? 0,
        newCustomers: data?.newCustomers ?? data?.new_customers ?? 0,
        returningCustomers: data?.returningCustomers ?? data?.returning_customers ?? 0,
        customerGrowth: {
          current: data?.customerGrowth?.current ?? data?.customer_growth?.current ?? 0,
          previous: data?.customerGrowth?.previous ?? data?.customer_growth?.previous ?? 0,
          change: data?.customerGrowth?.change ?? data?.customer_growth?.change ?? 0,
        },
      };
    },
    {
      errorMessage: 'Failed to fetch customer analytics',
      showErrorToast: false
    }
  ) || getDefaultCustomerAnalytics();
};

// Export revenue report
export const exportRevenueReport = async (
  startDate: string,
  endDate: string,
  format: 'csv' | 'excel' = 'csv'
) => {
  return await handleApiCall(
    async () => {
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);
      params.append('format', format);
      
      const response = await api.get(`/analytics/revenue/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return response.data;
    },
    {
      successMessage: 'Revenue report exported successfully',
      errorMessage: 'Failed to export revenue report',
      showSuccessToast: true
    }
  );
};

// Default/fallback data generators
const getDefaultRevenueStats = (): RevenueStats => ({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  growth: { revenue: 0, orders: 0 },
  periodComparison: { current: 0, previous: 0, change: 0 },
});

const getDefaultOrderAnalytics = () => ({
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  statusDistribution: [],
  dailyOrders: [] as ChartDataPoint[], // ✅ Properly typed
});

const getDefaultCustomerAnalytics = () => ({
  totalCustomers: 0,
  newCustomers: 0,
  returningCustomers: 0,
  customerGrowth: { current: 0, previous: 0, change: 0 },
});

// Utility to get daily revenue data as ChartDataPoint format
export const getDailyRevenueChart = async (period: string = '7d'): Promise<ChartDataPoint[]> => {
  try {
    const revenueData = await getRevenueChart(period, 'day');
    
    // Convert RevenueChartData[] to ChartDataPoint[]
    return revenueData.map(item => ({
      date: item.date,
      count: item.revenue // Using revenue as count for chart display
    }));
  } catch (error) {
    console.error('Failed to fetch daily revenue chart:', error);
    return [];
  }
};
