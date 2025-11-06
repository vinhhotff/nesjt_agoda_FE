import { api } from './callApi';

// Types
export interface Table {
  _id: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  location?: string;
  qrCode?: string;
  currentOrders?: string[];
  createdAt: string;
  updatedAt: string;
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance'
}

export interface CreateTableDto {
  tableName: string;
  tableNumber: number;
  capacity: number;
  location?: string;
}

export interface UpdateTableDto {
  tableName?: string;
  tableNumber?: number;
  capacity?: number;
  status?: TableStatus;
  location?: string;
}

export interface QRSessionData {
  tableId: string;
  tableName: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  location?: string;
  sessionId?: string;
  qrCode?: string;
}

export interface GuestInfo {
  guestName: string;
  guestPhone?: string;
  sessionId: string;
}

// API Functions
class TableAPI {
  private baseUrl = '/tables';

  // Get table by ID
  async getTable(id: string): Promise<Table> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get table by QR code (for guests scanning)
  async getTableByQRCode(qrCode: string): Promise<QRSessionData> {
    try {
      // Decode QR code to get table info
      const tableInfo = this.decodeQRCode(qrCode);
      
      // Get table details from backend
      const table = await this.getTable(tableInfo.tableId);
      
      // Create or get existing QR session
      const sessionData = await this.createOrGetQRSession(table);
      
      return {
        tableId: table._id,
        tableName: table.tableName,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        location: table.location,
        sessionId: sessionData.sessionId,
        qrCode: qrCode
      };
    } catch (error) {
      console.error('Error getting table by QR code:', error);
      throw new Error('Mã QR không hợp lệ hoặc bàn không tồn tại');
    }
  }

  // Create or get existing QR session
  private async createOrGetQRSession(table: Table): Promise<{ sessionId: string }> {
    try {
      // Check if there's an existing active session for this table
      const existingSession = await api.get(`/qr-orders/table/${table._id}/active-session`);
      
      if (existingSession.data && existingSession.data.sessionId) {
        return { sessionId: existingSession.data.sessionId };
      }
    } catch (error) {
      // No existing session, create new one
    }

    try {
      // Create new QR session
      const newSession = await api.post('/qr-orders/create-session', {
        tableId: table._id,
        tableName: table.tableName
      });
      
      return { sessionId: newSession.data._id };
    } catch (error) {
      console.error('Error creating QR session:', error);
      throw new Error('Không thể tạo phiên đặt món');
    }
  }

  // Register guest for table session
  async registerGuest(sessionId: string, guestInfo: Omit<GuestInfo, 'sessionId'>): Promise<GuestInfo> {
    try {
      const response = await api.post('/qr-orders/register-guest', {
        sessionId,
        ...guestInfo
      });
      
      return {
        ...guestInfo,
        sessionId
      };
    } catch (error) {
      console.error('Error registering guest:', error);
      throw new Error('Không thể đăng ký thông tin khách hàng');
    }
  }

  // Get all tables with pagination
  async getTables(page: number = 1, limit: number = 10, search?: string): Promise<{
    items: Table[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (search) {
      params.append('qs', search);
    }

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Create new table
  async createTable(tableData: CreateTableDto): Promise<Table> {
    const response = await api.post(this.baseUrl, tableData);
    return response.data;
  }

  // Update table
  async updateTable(id: string, updateData: UpdateTableDto): Promise<Table> {
    const response = await api.patch(`${this.baseUrl}/${id}`, updateData);
    return response.data;
  }

  // Delete table
  async deleteTable(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Get tables by status
  async getTablesByStatus(status: TableStatus): Promise<Table[]> {
    const response = await api.get(`${this.baseUrl}/status/${status}`);
    return response.data;
  }

  // Update table status
  async updateTableStatus(id: string, status: TableStatus): Promise<Table> {
    return this.updateTable(id, { status });
  }

  // Utility functions
  generateQRCode(tableId: string, tableNumber: number): string {
    // Generate QR code string that contains table information
    const qrData = {
      type: 'table',
      tableId,
      tableNumber,
      timestamp: Date.now()
    };
    
    // Encode to base64 for QR code
    return btoa(JSON.stringify(qrData));
  }

  decodeQRCode(qrCode: string): { tableId: string; tableNumber: number } {
    try {
      const decoded = JSON.parse(atob(qrCode));
      
      if (decoded.type !== 'table' || !decoded.tableId) {
        throw new Error('Invalid QR code format');
      }
      
      return {
        tableId: decoded.tableId,
        tableNumber: decoded.tableNumber
      };
    } catch (error) {
      throw new Error('Mã QR không hợp lệ');
    }
  }

  // Generate QR code data URL for display
  generateQRCodeDataURL(qrCode: string, tableName: string): string {
    // This would typically use a QR code library like qrcode
    // For now, return a placeholder SVG
    const qrContent = encodeURIComponent(qrCode);
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white" stroke="#e5e7eb" stroke-width="2"/>
        <rect x="20" y="20" width="160" height="160" fill="none" stroke="#374151" stroke-width="1"/>
        
        <!-- QR Pattern Simulation -->
        <g fill="#000">
          <rect x="30" y="30" width="20" height="20"/>
          <rect x="60" y="30" width="10" height="10"/>
          <rect x="80" y="30" width="10" height="10"/>
          <rect x="100" y="30" width="20" height="10"/>
          <rect x="140" y="30" width="20" height="20"/>
          
          <rect x="30" y="60" width="10" height="10"/>
          <rect x="50" y="60" width="20" height="10"/>
          <rect x="90" y="60" width="10" height="10"/>
          <rect x="110" y="60" width="20" height="10"/>
          <rect x="150" y="60" width="10" height="10"/>
          
          <rect x="40" y="90" width="10" height="10"/>
          <rect x="70" y="90" width="10" height="10"/>
          <rect x="100" y="90" width="10" height="10"/>
          <rect x="130" y="90" width="20" height="10"/>
          
          <rect x="30" y="120" width="20" height="10"/>
          <rect x="70" y="120" width="10" height="10"/>
          <rect x="100" y="120" width="10" height="10"/>
          <rect x="140" y="120" width="10" height="20"/>
          
          <rect x="30" y="150" width="20" height="20"/>
          <rect x="70" y="150" width="20" height="10"/>
          <rect x="110" y="150" width="10" height="20"/>
          <rect x="140" y="150" width="20" height="20"/>
        </g>
        
        <text x="100" y="190" text-anchor="middle" font-family="Arial" font-size="12" fill="#374151">
          ${tableName}
        </text>
      </svg>
    `)}`;
  }

  getStatusColor(status: TableStatus): string {
    const colors = {
      [TableStatus.AVAILABLE]: '#10b981', // emerald-500
      [TableStatus.OCCUPIED]: '#ef4444', // red-500
      [TableStatus.RESERVED]: '#f59e0b', // amber-500
      [TableStatus.MAINTENANCE]: '#6b7280', // gray-500
    };
    return colors[status] || '#6b7280';
  }

  getStatusText(status: TableStatus): string {
    const texts = {
      [TableStatus.AVAILABLE]: 'Có sẵn',
      [TableStatus.OCCUPIED]: 'Đã có khách',
      [TableStatus.RESERVED]: 'Đã đặt',
      [TableStatus.MAINTENANCE]: 'Bảo trì',
    };
    return texts[status] || status;
  }

  getStatusIcon(status: TableStatus): string {
    const icons = {
      [TableStatus.AVAILABLE]: '✅',
      [TableStatus.OCCUPIED]: '👥',
      [TableStatus.RESERVED]: '📅',
      [TableStatus.MAINTENANCE]: '🔧',
    };
    return icons[status] || '📋';
  }

  // Format capacity display
  formatCapacity(capacity: number): string {
    return `${capacity} ${capacity === 1 ? 'người' : 'người'}`;
  }
}

export const tableAPI = new TableAPI();
