import { api } from './callApi';

// Types
export interface QRSession {
  _id: string;
  qrCode: string;
  tableId: string;
  tableName: string;
  isActive: boolean;
  orders: QROrder[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QROrder {
  _id: string;
  sessionId: string;
  items: QROrderItem[];
  customerName?: string;
  customerPhone?: string;
  status: QROrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface QROrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export enum QROrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

export interface CreateQRSessionDto {
  tableId: string;
  tableName: string;
}

export interface UpdateQRSessionDto {
  isActive?: boolean;
  tableId?: string;
  tableName?: string;
}

export interface QROrderDto {
  sessionId: string;
  items: {
    menuItemId: string;
    quantity: number;
    notes?: string;
  }[];
  customerName?: string;
  customerPhone?: string;
}

// API Functions
class QROrderAPI {
  private baseUrl = '/qr-orders';

  // Create QR session for table
  async createQRSession(data: CreateQRSessionDto): Promise<QRSession> {
    const response = await api.post(`${this.baseUrl}/create-session`, data);
    return response.data;
  }

  // Add order to QR session
  async addOrderToSession(orderData: QROrderDto): Promise<QROrder> {
    const response = await api.post(`${this.baseUrl}/add-order`, orderData);
    return response.data;
  }

  // Get QR session by QR code
  async getQRSession(qrCode: string): Promise<QRSession> {
    const response = await api.get(`${this.baseUrl}/${qrCode}`);
    return response.data;
  }

  // Update QR session
  async updateQRSession(qrCode: string, data: UpdateQRSessionDto): Promise<QRSession> {
    const response = await api.patch(`${this.baseUrl}/${qrCode}`, data);
    return response.data;
  }

  // Utility functions
  generateQRCode(tableId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `QR_${tableId}_${timestamp}_${random}`;
  }

  getOrderStatusColor(status: QROrderStatus): string {
    const colors = {
      [QROrderStatus.PENDING]: '#fbbf24', // amber-400
      [QROrderStatus.CONFIRMED]: '#3b82f6', // blue-500
      [QROrderStatus.PREPARING]: '#f59e0b', // amber-500
      [QROrderStatus.READY]: '#10b981', // emerald-500
      [QROrderStatus.SERVED]: '#6b7280', // gray-500
      [QROrderStatus.CANCELLED]: '#ef4444', // red-500
    };
    return colors[status] || '#6b7280';
  }

  getOrderStatusText(status: QROrderStatus): string {
    const texts = {
      [QROrderStatus.PENDING]: 'Chờ xác nhận',
      [QROrderStatus.CONFIRMED]: 'Đã xác nhận',
      [QROrderStatus.PREPARING]: 'Đang chuẩn bị',
      [QROrderStatus.READY]: 'Sẵn sàng',
      [QROrderStatus.SERVED]: 'Đã phục vụ',
      [QROrderStatus.CANCELLED]: 'Đã hủy',
    };
    return texts[status] || status;
  }

  getOrderStatusIcon(status: QROrderStatus): string {
    const icons = {
      [QROrderStatus.PENDING]: '⏳',
      [QROrderStatus.CONFIRMED]: '✅',
      [QROrderStatus.PREPARING]: '👨‍🍳',
      [QROrderStatus.READY]: '🍽️',
      [QROrderStatus.SERVED]: '✨',
      [QROrderStatus.CANCELLED]: '❌',
    };
    return icons[status] || '📋';
  }

  calculateOrderTotal(items: QROrderItem[]): number {
    return items.reduce((total, item) => total + item.subtotal, 0);
  }

  calculateSessionTotal(session: QRSession): number {
    return session.orders.reduce((total, order) => total + order.totalAmount, 0);
  }

  formatQRCodeForDisplay(qrCode: string): string {
    // Extract readable parts from QR code for display
    const parts = qrCode.split('_');
    if (parts.length >= 2) {
      return `Table ${parts[1]} - ${parts[2] ? new Date(parseInt(parts[2])).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Active'}`;
    }
    return qrCode;
  }

  // Generate QR code data URL for display
  generateQRCodeDataURL(qrCode: string): string {
    // This would typically use a QR code library like qrcode
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" fill="black">
        QR Code
      </text>
      <text x="100" y="120" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="gray">
        ${qrCode}
      </text>
    </svg>`)}`;
  }
}

export const qrOrderAPI = new QROrderAPI();
