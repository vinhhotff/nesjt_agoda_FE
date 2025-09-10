import { OrderAnalytics, RevenueStats, TopSellingItem, ChartDataPoint } from '@/src/Types';

// Generic function to handle API calls with fallback
export async function fetchWithFallback<T>(
  apiCall: () => Promise<T>,
  fallback: T | (() => T | Promise<T>),
  errorMessage?: string
): Promise<T> {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    }
    return typeof fallback === 'function' ? await (fallback as any)() : fallback;
  }
}

// Specific fallback data generators
export const getDefaultOrderAnalytics = (): OrderAnalytics => ({
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  statusDistribution: [],
  dailyOrders: [] as ChartDataPoint[],
});

export const getDefaultRevenueStats = (): RevenueStats => ({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  growth: {
    revenue: 0,
    orders: 0,
  },
  periodComparison: {
    current: 0,
    previous: 0,
    change: 0,
  },
});

export const getDefaultTopSellingItems = (): TopSellingItem[] => [];

// Type-safe data validator
export const validateOrderAnalytics = (data: any): OrderAnalytics | null => {
  if (!data || typeof data !== 'object') return null;
  
  try {
    return {
      totalOrders: Number(data.totalOrders) || 0,
      pendingOrders: Number(data.pendingOrders) || 0,
      completedOrders: Number(data.completedOrders) || 0,
      cancelledOrders: Number(data.cancelledOrders) || 0,
      statusDistribution: Array.isArray(data.statusDistribution) 
        ? data.statusDistribution 
        : [],
      dailyOrders: Array.isArray(data.dailyOrders) 
        ? data.dailyOrders.map((item: any) => ({
            date: String(item.date || ''),
            count: Number(item.count) || 0,
          }))
        : [] as ChartDataPoint[],
    };
  } catch (error) {
    console.warn('Failed to validate OrderAnalytics data:', error);
    return null;
  }
};

// Safe array converter for chart data
export const ensureChartDataPoints = (data: any[]): ChartDataPoint[] => {
  if (!Array.isArray(data)) return [];
  
  return data.map((item, index) => ({
    date: item.date || item._id || `Day ${index + 1}`,
    count: Number(item.count) || Number(item.value) || 0,
  }));
};

// API response normalizer
export const normalizeApiResponse = <T>(response: any, dataKey?: string): T | null => {
  if (!response) return null;
  
  // Handle different response structures
  if (dataKey && response[dataKey]) {
    return response[dataKey];
  }
  
  if (response.data) {
    return response.data;
  }
  
  return response;
};
