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
  // Backend returns { orders: Order[], total, totalPages }
  if ('orders' in res && Array.isArray(res.orders)) return res.orders;
  if (Array.isArray(res)) return res;
  if ('results' in res && Array.isArray(res.results)) return res.results;
  if ('data' in res) {
    if (Array.isArray(res.data)) return res.data;
    if ('orders' in res.data && Array.isArray(res.data.orders))
      return res.data.orders;
    if ('results' in res.data && Array.isArray(res.data.results))
      return res.data.results;
  }
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
  // Backend returns { orders: Order[], total, totalPages } - extract orders array
  const data = response.data;
  if (data && typeof data === 'object' && 'orders' in data) {
    return data.orders;
  }
  return Array.isArray(data) ? data : [];
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
    
    // Add search parameter (backend might use 'guest' or 'search')
    if (search) {
      query.guest = search; // Backend supports guest parameter for search
      query.search = search; // Also try standard search parameter
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
    const response = await api.patch(`/payments/order/${orderId}/mark-paid`, {
      isPaid,
      method: 'CASH',
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    try {
      const fallbackResponse = await api.patch(`/orders/${orderId}/paid`, {
        isPaid,
      });
      return fallbackResponse.data;
    } catch (fallbackError) {
      throw fallbackError;
    }
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
    const orders = await getOrders(filters);

    const csvHeaders =
      'Order ID,Guest,Items Count,Total Price,Status,Order Type,Created Date\n';
    const csvContent = orders
      .map((order) => {
        const guestName =
          typeof order.guest === 'string'
            ? order.guest
            : (order.guest as any)?.guestName || 'N/A';
        const createdDate = new Date(order.createdAt).toLocaleDateString();

        return `${order._id},"${guestName}",${order.items.length},${
          order.totalPrice
        },${order.status},${order.orderType || 'DINE_IN'},${createdDate}`;
      })
      .join('\n');

    const fullCSV = csvHeaders + csvContent;
    const blob = new Blob([fullCSV], { type: 'text/csv;charset=utf-8;' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Error exporting orders to CSV:', error);
    throw error;
  }
};
