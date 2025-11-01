import { api } from './callApi';
import { Order, CreateOnlineOrderDto, OrdersApiResponse } from '@/src/Types';
import { fetchPaginated, PaginationQuery } from './paginationApi';

export const createOnlineOrder = async (orderData: CreateOnlineOrderDto) => {
  try {
    const response = await api.post('/orders/online', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating online order:', error);
    throw error;
  }
};

export const createOrder = async (data: Partial<Order>): Promise<Order> => {
  const response = await api.post<Order>('/orders', data);
  return response.data;
};

export function extractOrders(res: OrdersApiResponse): Order[] {
  // Handle nested data.data structure from backend
  if ('data' in res && res.data && typeof res.data === 'object') {
    // Check for double-nested: { data: { data: [...] } }
    if ('data' in res.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    // Single nested: { data: [...] }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    // Legacy nested: { data: { orders: [...] } }
    if ('orders' in res.data && Array.isArray(res.data.orders)) {
      return res.data.orders;
    }
    // Legacy nested: { data: { results: [...] } }
    if ('results' in res.data && Array.isArray(res.data.results)) {
      return res.data.results;
    }
  }
  // Legacy format: { orders: Order[] }
  if ('orders' in res && Array.isArray(res.orders)) return res.orders;
  // Direct array
  if (Array.isArray(res)) return res;
  // Legacy format: { results: Order[] }
  if ('results' in res && Array.isArray(res.results)) return res.results;
  
  return [];
}

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

export const updateOrder = async (
  id: string,
  data: Partial<Order>
): Promise<Order> => {
  const response = await api.patch<Order>(`/orders/${id}`, data);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};

export const getOrders = async (params?: Record<string, unknown>) => {
  const response = await api.get('/orders', { params });
  const payload = response.data;
  // Preferred backend format: { statusCode, message, data: { data: Order[], meta }, timestamp }
  const nestedItems = payload?.data?.data;
  if (Array.isArray(nestedItems)) return nestedItems as Order[];
  // Fallbacks for legacy shapes
  if (payload && typeof payload === 'object' && 'orders' in payload) return payload.orders;
  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)) return payload.data;
  return Array.isArray(payload) ? payload : [];
};

// Enhanced Orders API using standardized pagination
export const getOrdersPaginate = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    // Build query using standardized format
    const query: PaginationQuery = {
      page,
      limit,
      sortBy,
      sortOrder,
    };
    
    // Add search parameter
    if (search) {
      query.search = search;
    }
    
    // Add status filter
    if (status) {
      query.status = status;
    }
    
    // Use standardized pagination API
    const result = await fetchPaginated<Order>('/orders', query);
    
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  } catch (error) {
    console.error('Error fetching paginated orders:', error);
    return {
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
};

export const updateOrderStatus = async (
  id: string,
  status: string,
  note?: string
) => {
  try {
 
    const normalizedStatus = status.trim().toLowerCase();

    const updateOrderStatusDto = {
      status: normalizedStatus as
        | 'pending'
        | 'preparing'
        | 'served'
        | 'cancelled',
    };

    const response = await api.patch(
      `/orders/${id}/status`,
      updateOrderStatusDto
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    throw error;
  }
};

export const getOrderDetails = async (id: string) => {
  try {
    const response = await getOrder(id);
    return response;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const markOrderAsPaid = async (orderId: string, isPaid: boolean) => {
  try {
    const response = await api.patch(`/orders/${orderId}/paid`, {
      isPaid,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const setOrderReadyTime = async (
  id: string,
  estimatedReadyTime: Date
) => {
  try {
    const response = await api.patch(`/orders/${id}`, { estimatedReadyTime });
    return response.data;
  } catch (error) {
    console.error('Error setting order ready time:', error);
    throw error;
  }
};

export const getOrderStats = async () => {
  try {
    const response = await api.get('/orders/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return {
      total: 0,
      pending: 0,
      preparing: 0,
      served: 0,
      cancelled: 0,
      totalRevenue: 0,
    };
  }
};

export const exportOrdersToCSV = async (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    // Fetch a large page to export (adjust limit as needed)
    const params: Record<string, unknown> = { ...filters, page: 1, limit: 100 };
    const orders = await getOrders(params);

    const csvHeaders = 'Order ID,Customer,Phone,Items Count,Total Price,Status,Order Type,Created Date\n';
    const rows = orders.map((order: any) => {
      const customer = order.customerName ||
        (typeof order.guest === 'object' ? order.guest?.guestName : (typeof order.guest === 'string' ? order.guest : undefined)) ||
        (order.user && typeof order.user === 'object' ? order.user.name : undefined) ||
        'N/A';
      const phone = order.customerPhone || (typeof order.guest === 'object' ? order.guest?.guestPhone : '') || '';
      const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
      const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
      const total = typeof order.totalPrice === 'number' ? order.totalPrice : 0;
      const orderType = order.orderType || 'DINE_IN';
      const status = order.status || '';

      // Escape quotes in fields
      const safe = (v: string) => `"${String(v).replace(/"/g, '""')}"`;

      return [
        order._id,
        safe(customer),
        safe(phone),
        itemsCount,
        total,
        status,
        orderType,
        createdDate,
      ].join(',');
    });

    const csvContent = [csvHeaders, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, count: orders.length };
  } catch (error) {
    console.error('Error exporting orders to CSV:', error);
    throw error;
  }
};
