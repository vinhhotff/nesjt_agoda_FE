import { api } from './callApi';

// Types
export interface Delivery {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: DeliveryStatus;
  assignedDriver?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface CreateDeliveryDto {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  estimatedDeliveryTime?: string;
  deliveryNotes?: string;
}

export interface UpdateDeliveryDto {
  status?: DeliveryStatus;
  assignedDriver?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryNotes?: string;
}

// API Functions
class DeliveryAPI {
  private baseUrl = '/deliveries';

  // Create new delivery
  async createDelivery(data: CreateDeliveryDto): Promise<Delivery> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  // Get delivery by order ID
  async getDeliveryByOrderId(orderId: string): Promise<Delivery> {
    const response = await api.get(`${this.baseUrl}/order/${orderId}`);
    return response.data;
  }

  // Update delivery
  async updateDelivery(id: string, data: UpdateDeliveryDto): Promise<Delivery> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Utility functions
  getStatusColor(status: DeliveryStatus): string {
    const colors = {
      [DeliveryStatus.PENDING]: '#fbbf24', // amber-400
      [DeliveryStatus.ASSIGNED]: '#3b82f6', // blue-500
      [DeliveryStatus.PICKED_UP]: '#8b5cf6', // violet-500
      [DeliveryStatus.IN_TRANSIT]: '#f59e0b', // amber-500
      [DeliveryStatus.DELIVERED]: '#10b981', // emerald-500
      [DeliveryStatus.FAILED]: '#ef4444', // red-500
      [DeliveryStatus.CANCELLED]: '#6b7280', // gray-500
    };
    return colors[status] || '#6b7280';
  }

  getStatusText(status: DeliveryStatus): string {
    const texts = {
      [DeliveryStatus.PENDING]: 'Chờ phân công',
      [DeliveryStatus.ASSIGNED]: 'Đã phân công',
      [DeliveryStatus.PICKED_UP]: 'Đã lấy hàng',
      [DeliveryStatus.IN_TRANSIT]: 'Đang giao',
      [DeliveryStatus.DELIVERED]: 'Đã giao',
      [DeliveryStatus.FAILED]: 'Giao thất bại',
      [DeliveryStatus.CANCELLED]: 'Đã hủy',
    };
    return texts[status] || status;
  }

  getStatusIcon(status: DeliveryStatus): string {
    const icons = {
      [DeliveryStatus.PENDING]: '⏳',
      [DeliveryStatus.ASSIGNED]: '👤',
      [DeliveryStatus.PICKED_UP]: '📦',
      [DeliveryStatus.IN_TRANSIT]: '🚗',
      [DeliveryStatus.DELIVERED]: '✅',
      [DeliveryStatus.FAILED]: '❌',
      [DeliveryStatus.CANCELLED]: '🚫',
    };
    return icons[status] || '📋';
  }

  formatDeliveryTime(delivery: Delivery): string {
    if (delivery.actualDeliveryTime) {
      return `Đã giao lúc: ${new Date(delivery.actualDeliveryTime).toLocaleString('vi-VN')}`;
    }
    if (delivery.estimatedDeliveryTime) {
      return `Dự kiến: ${new Date(delivery.estimatedDeliveryTime).toLocaleString('vi-VN')}`;
    }
    return 'Chưa có thời gian giao';
  }
}

export const deliveryAPI = new DeliveryAPI();
