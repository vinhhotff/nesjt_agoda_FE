import { callApi, isAnalyticsEndpointMissing } from './callApi';
import { OrderAnalytics, RevenueChartData, RevenueStats, TopSellingItem, ChartDataPoint } from '@/src/Types';
import { getOrderCount, getRevenue } from '../api';
import { 
  fetchWithFallback,
  getDefaultOrderAnalytics,
  getDefaultRevenueStats,
  validateOrderAnalytics,
  ensureChartDataPoints
} from '../utils/fetchWithFallback';

export const getTodayStats = async () => {
  try {
    const data = await callApi<any>('/analytics/today');
    return data;
  } catch (error) {
    if (!isAnalyticsEndpointMissing(error)) {
      console.warn('getTodayStats failed:', (error as any)?.message);
    }
    return null;
  }
};

export const getWeeklyTrends = async () => {
  try {
    const data = await callApi<any>('/analytics/weekly-trends');
    return data;
  } catch (error) {
    if (!isAnalyticsEndpointMissing(error)) {
      console.warn('getWeeklyTrends failed:', (error as any)?.message);
    }
    return [] as any[];
  }
};

export const getRevenueStats = async (
  period: string = '30d',
  startDate?: string,
  endDate?: string
): Promise<RevenueStats> => {
  try {
    const params = new URLSearchParams();
    if (period && period !== 'custom') params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await callApi<any>('/analytics/revenue/stats', params, 3000);
    const data = res.data || res;

    return {
      totalRevenue: data.totalRevenue ?? data.total_revenue ?? 0,
      totalOrders: data.totalOrders ?? data.total_orders ?? 0,
      averageOrderValue: data.averageOrderValue ?? data.average_order_value ?? 0,
      growth: {
        revenue: data.growth?.revenue ?? data.revenue_growth ?? 0,
        orders: data.growth?.orders ?? data.orders_growth ?? 0,
      },
      periodComparison: {
        current: data.periodComparison?.current ?? data.current_period ?? 0,
        previous: data.periodComparison?.previous ?? data.previous_period ?? 0,
        change: data.periodComparison?.change ?? data.period_change ?? 0,
      },
    } as RevenueStats;
  } catch (error) {
    if (!isAnalyticsEndpointMissing(error)) {
      console.warn('Revenue stats API failed, using fallback:', (error as any)?.message);
    }
    try {
      const revenue = await getRevenue();
      const orderCount = await getOrderCount();
      const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;
      return {
        totalRevenue: revenue,
        totalOrders: orderCount,
        averageOrderValue,
        growth: { revenue: 0, orders: 0 },
        periodComparison: { current: revenue, previous: Math.floor(revenue * 0.9), change: 10 },
      } as RevenueStats;
    } catch {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        growth: { revenue: 0, orders: 0 },
        periodComparison: { current: 0, previous: 0, change: 0 },
      } as RevenueStats;
    }
  }
};

export const getRevenueChart = async (
  period: string = '7d',
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<RevenueChartData[]> => {
  try {
    const params = new URLSearchParams();
    if (period && period !== 'custom') params.append('period', period);
    params.append('groupBy', groupBy);
    const res = await callApi<any>('/analytics/revenue/chart', params, 3000);
    const data = res.data || res;
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        date: item.date || item._id || '',
        revenue: item.revenue || item.totalRevenue || item.total_revenue || 0,
        orders: item.orders || item.orderCount || item.order_count || 0,
      }));
    }
    return [];
  } catch (error) {
    if (!isAnalyticsEndpointMissing(error)) {
      console.warn('Revenue chart API failed:', (error as any)?.message);
    }
    return [];
  }
};

export const getTopSellingItems = async (
  period: string = '30d',
  limit: number = 10
): Promise<TopSellingItem[]> => {
  try {
    const params = new URLSearchParams();
    if (period && period !== 'custom') params.append('period', period);
    params.append('limit', String(limit));
    const res = await callApi<any>('/analytics/menu-items/top-selling', params, 3000);
    const data = res.data || res;
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
  } catch (error) {
    if (!isAnalyticsEndpointMissing(error)) {
      console.warn('Top selling items API failed:', (error as any)?.message);
    }
    return [];
  }
};

export const getFallbackOrderAnalytics = async (): Promise<OrderAnalytics | null> => {
  try {
    const totalOrders = await getOrderCount();
    const completed = Math.floor(totalOrders * 0.8);
    const pending = Math.floor(totalOrders * 0.1);
    const cancelled = totalOrders - completed - pending;
    const dailyOrders: ChartDataPoint[] = [];
    return {
      totalOrders,
      pendingOrders: pending,
      completedOrders: completed,
      cancelledOrders: cancelled,
      statusDistribution: [
        { status: 'completed', count: completed, percentage: totalOrders ? (completed / totalOrders) * 100 : 0 },
        { status: 'pending', count: pending, percentage: totalOrders ? (pending / totalOrders) * 100 : 0 },
        { status: 'cancelled', count: cancelled, percentage: totalOrders ? (cancelled / totalOrders) * 100 : 0 },
      ],
      dailyOrders,
    };
  } catch (e) {
    return null;
  }
};

export const getOrderAnalytics = async (period: string = '30d'): Promise<OrderAnalytics | null> => {
  return await fetchWithFallback(
    async () => {
      const params = new URLSearchParams();
      if (period && period !== 'custom') params.append('period', period);
      const res = await callApi<any>('/analytics/orders/stats', params, 3000);
      const data = res.data || res;
      const daily = (data.dailyOrders || data.daily_orders || []) as any[];
      const dailyOrders = ensureChartDataPoints(daily);
      
      const analytics: OrderAnalytics = {
        totalOrders: data.totalOrders ?? data.total_orders ?? 0,
        pendingOrders: data.pendingOrders ?? data.pending_orders ?? 0,
        completedOrders: data.completedOrders ?? data.completed_orders ?? 0,
        cancelledOrders: data.cancelledOrders ?? data.cancelled_orders ?? 0,
        statusDistribution: data.statusDistribution ?? data.status_distribution ?? [],
        dailyOrders,
      };
      
      return validateOrderAnalytics(analytics) || getDefaultOrderAnalytics();
    },
    async () => await getFallbackOrderAnalytics() || getDefaultOrderAnalytics(),
    'Order analytics API failed, using fallback'
  );
};
