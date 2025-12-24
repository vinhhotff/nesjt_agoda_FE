import { api } from './callApi';

// Types
export interface QRPaymentRequest {
  orderId: string;
  amount: number;
  currency: 'VND';
  method: PaymentMethod;
  customerName: string;
  customerPhone?: string;
  description?: string;
}

export interface QRPaymentResponse {
  paymentId: string;
  qrCode: string;
  qrCodeDataURL: string;
  amount: number;
  currency: string;
  expiresAt: string;
  status: PaymentStatus;
  instructions: PaymentInstructions;
}

export interface PaymentInstructions {
  title: string;
  steps: string[];
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  notes?: string[];
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  VIETQR = 'vietqr',
  CASH = 'cash'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface PaymentStatusCheck {
  paymentId: string;
  status: PaymentStatus;
  paidAt?: string;
  failureReason?: string;
  transactionId?: string;
}

// API Functions
class QRPaymentAPI {
  private baseUrl = '/payments';

  // Create QR payment
  async createQRPayment(paymentRequest: QRPaymentRequest): Promise<QRPaymentResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/qr-payment`, paymentRequest);
      return response.data;
    } catch (error) {
      console.error('Error creating QR payment:', error);
      throw new Error('Không thể tạo mã QR thanh toán');
    }
  }

  // Check payment status
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatusCheck> {
    try {
      const response = await api.get(`${this.baseUrl}/qr-payment/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new Error('Không thể kiểm tra trạng thái thanh toán');
    }
  }

  // Cancel payment
  async cancelPayment(paymentId: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/qr-payment/${paymentId}/cancel`);
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw new Error('Không thể hủy thanh toán');
    }
  }

  // Simulate QR payment creation (for development)
  async createMockQRPayment(paymentRequest: QRPaymentRequest): Promise<QRPaymentResponse> {
    // Remove unnecessary delay for faster loading
    // await new Promise(resolve => setTimeout(resolve, 1000));

    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const qrCodeData = {
      type: 'payment',
      paymentId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      method: paymentRequest.method,
      orderId: paymentRequest.orderId
    };

    const qrCode = btoa(JSON.stringify(qrCodeData));
    const qrCodeDataURL = this.generateQRCodeDataURL(qrCode, paymentRequest.amount, paymentRequest.method);

    return {
      paymentId,
      qrCode,
      qrCodeDataURL,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      expiresAt,
      status: PaymentStatus.PENDING,
      instructions: this.getPaymentInstructions(paymentRequest.method, paymentRequest.amount)
    };
  }

  // Generate QR code data URL for display
  private generateQRCodeDataURL(qrCode: string, amount: number, method: PaymentMethod): string {
    const methodInfo = this.getMethodInfo(method);
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="250" height="300" viewBox="0 0 250 300">
        <!-- QR Code Background -->
        <rect width="250" height="250" fill="white" stroke="#e5e7eb" stroke-width="2"/>
        
        <!-- QR Pattern Simulation -->
        <g fill="#000">
          <!-- Corner markers -->
          <rect x="20" y="20" width="30" height="30"/>
          <rect x="200" y="20" width="30" height="30"/>
          <rect x="20" y="200" width="30" height="30"/>
          
          <!-- Data pattern simulation -->
          <rect x="60" y="30" width="8" height="8"/>
          <rect x="80" y="30" width="12" height="8"/>
          <rect x="110" y="30" width="8" height="8"/>
          <rect x="140" y="30" width="16" height="8"/>
          <rect x="180" y="30" width="8" height="8"/>
          
          <rect x="30" y="60" width="8" height="12"/>
          <rect x="50" y="60" width="16" height="8"/>
          <rect x="90" y="60" width="8" height="8"/>
          <rect x="120" y="60" width="12" height="8"/>
          <rect x="160" y="60" width="8" height="12"/>
          
          <rect x="70" y="90" width="8" height="8"/>
          <rect x="100" y="90" width="12" height="8"/>
          <rect x="130" y="90" width="8" height="8"/>
          <rect x="150" y="90" width="16" height="8"/>
          
          <rect x="40" y="120" width="12" height="8"/>
          <rect x="80" y="120" width="8" height="8"/>
          <rect x="110" y="120" width="8" height="12"/>
          <rect x="140" y="120" width="12" height="8"/>
          <rect x="170" y="120" width="8" height="8"/>
          
          <rect x="60" y="150" width="8" height="8"/>
          <rect x="90" y="150" width="16" height="8"/>
          <rect x="120" y="150" width="8" height="8"/>
          <rect x="150" y="150" width="8" height="12"/>
          
          <rect x="30" y="180" width="16" height="8"/>
          <rect x="70" y="180" width="8" height="8"/>
          <rect x="100" y="180" width="12" height="8"/>
          <rect x="140" y="180" width="8" height="8"/>
          <rect x="170" y="180" width="12" height="8"/>
        </g>
        
        <!-- Payment method icon -->
        <rect x="90" y="260" width="70" height="30" fill="${methodInfo.color}" rx="15"/>
        <text x="125" y="278" text-anchor="middle" font-family="Arial" font-size="12" fill="white">
          ${methodInfo.name}
        </text>
        
        <!-- Amount -->
        <text x="125" y="295" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">
          ${amount.toLocaleString('vi-VN')} ${method === PaymentMethod.VIETQR ? 'VNĐ' : 'VND'}
        </text>
      </svg>
    `)}`;
  }

  // Get payment method info
  private getMethodInfo(method: PaymentMethod) {
    const methodMap = {
      [PaymentMethod.BANK_TRANSFER]: { name: 'Bank', color: '#1e40af' },
      [PaymentMethod.MOMO]: { name: 'MoMo', color: '#d946ef' },
      [PaymentMethod.ZALOPAY]: { name: 'ZaloPay', color: '#0ea5e9' },
      [PaymentMethod.VIETQR]: { name: 'VietQR', color: '#dc2626' },
      [PaymentMethod.CASH]: { name: 'Cash', color: '#16a34a' }
    };
    return methodMap[method] || { name: 'Payment', color: '#6b7280' };
  }

  // Get payment instructions based on method
  private getPaymentInstructions(method: PaymentMethod, amount: number): PaymentInstructions {
    const formattedAmount = amount.toLocaleString('vi-VN');

    switch (method) {
      case PaymentMethod.VIETQR:
        return {
          title: 'Thanh toán qua VietQR',
          steps: [
            'Mở ứng dụng ngân hàng trên điện thoại',
            'Chọn chức năng "Quét mã QR" hoặc "QR Pay"',
            'Quét mã QR phía trên',
            'Kiểm tra thông tin và xác nhận thanh toán',
            'Chờ xác nhận từ hệ thống'
          ],
          bankInfo: {
            bankName: 'Vietcombank',
            accountNumber: '0123456789',
            accountName: 'NHA HANG AGODA'
          },
          notes: [
            `Số tiền: ${formattedAmount} VNĐ`,
            'Mã QR có hiệu lực trong 15 phút',
            'Liên hệ nhân viên nếu gặp sự cố'
          ]
        };

      case PaymentMethod.MOMO:
        return {
          title: 'Thanh toán qua Ví MoMo',
          steps: [
            'Mở ứng dụng MoMo trên điện thoại',
            'Chọn "Quét mã QR" từ trang chủ',
            'Quét mã QR phía trên',
            'Xác nhận số tiền và thông tin',
            'Nhập mã PIN để hoàn tất'
          ],
          notes: [
            `Số tiền: ${formattedAmount} VNĐ`,
            'Kiểm tra số dư ví MoMo trước khi thanh toán',
            'Bạn sẽ nhận được thông báo khi thanh toán thành công'
          ]
        };

      case PaymentMethod.ZALOPAY:
        return {
          title: 'Thanh toán qua ZaloPay',
          steps: [
            'Mở ứng dụng ZaloPay',
            'Chọn biểu tượng "Quét mã QR"',
            'Quét mã QR phía trên',
            'Kiểm tra thông tin thanh toán',
            'Xác nhận bằng mã PIN hoặc vân tay'
          ],
          notes: [
            `Số tiền: ${formattedAmount} VNĐ`,
            'Đảm bảo có đủ số dư trong ví ZaloPay',
            'Liên kết với ngân hàng nếu cần nạp tiền'
          ]
        };

      case PaymentMethod.BANK_TRANSFER:
        return {
          title: 'Chuyển khoản ngân hàng',
          steps: [
            'Mở ứng dụng ngân hàng',
            'Chọn "Chuyển khoản" hoặc "Chuyển tiền"',
            'Quét mã QR hoặc nhập thông tin tài khoản',
            'Nhập số tiền và nội dung chuyển khoản',
            'Xác nhận và hoàn tất giao dịch'
          ],
          bankInfo: {
            bankName: 'Vietcombank',
            accountNumber: '0123456789',
            accountName: 'NHA HANG AGODA'
          },
          notes: [
            `Số tiền: ${formattedAmount} VNĐ`,
            'Nội dung: Thanh toan don hang [Mã đơn hàng]',
            'Giao dịch có thể mất 1-2 phút để xử lý'
          ]
        };

      default:
        return {
          title: 'Thanh toán tiền mặt',
          steps: [
            'Gọi nhân viên đến bàn',
            'Yêu cầu hóa đơn thanh toán',
            'Kiểm tra chi tiết hóa đơn',
            'Thanh toán bằng tiền mặt',
            'Nhận hóa đơn và tiền thừa (nếu có)'
          ],
          notes: [
            `Số tiền: ${formattedAmount} VNĐ`,
            'Vui lòng chuẩn bị tiền lẻ',
            'Có thể áp dụng voucher giảm giá'
          ]
        };
    }
  }

  // Utility functions
  getStatusColor(status: PaymentStatus): string {
    const colors = {
      [PaymentStatus.PENDING]: '#fbbf24', // amber-400
      [PaymentStatus.PROCESSING]: '#3b82f6', // blue-500
      [PaymentStatus.COMPLETED]: '#10b981', // emerald-500
      [PaymentStatus.FAILED]: '#ef4444', // red-500
      [PaymentStatus.EXPIRED]: '#f59e0b', // amber-500
      [PaymentStatus.CANCELLED]: '#6b7280', // gray-500
    };
    return colors[status] || '#6b7280';
  }

  getStatusText(status: PaymentStatus): string {
    const texts = {
      [PaymentStatus.PENDING]: 'Chờ thanh toán',
      [PaymentStatus.PROCESSING]: 'Đang xử lý',
      [PaymentStatus.COMPLETED]: 'Đã thanh toán',
      [PaymentStatus.FAILED]: 'Thất bại',
      [PaymentStatus.EXPIRED]: 'Hết hạn',
      [PaymentStatus.CANCELLED]: 'Đã hủy',
    };
    return texts[status] || status;
  }

  getStatusIcon(status: PaymentStatus): string {
    const icons = {
      [PaymentStatus.PENDING]: '⏳',
      [PaymentStatus.PROCESSING]: '🔄',
      [PaymentStatus.COMPLETED]: '✅',
      [PaymentStatus.FAILED]: '❌',
      [PaymentStatus.EXPIRED]: '⏰',
      [PaymentStatus.CANCELLED]: '🚫',
    };
    return icons[status] || '💳';
  }

  getMethodIcon(method: PaymentMethod): string {
    const icons = {
      [PaymentMethod.BANK_TRANSFER]: '🏦',
      [PaymentMethod.MOMO]: '📱',
      [PaymentMethod.ZALOPAY]: '💙',
      [PaymentMethod.VIETQR]: '🔴',
      [PaymentMethod.CASH]: '💵',
    };
    return icons[method] || '💳';
  }

  getMethodName(method: PaymentMethod): string {
    const names = {
      [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
      [PaymentMethod.MOMO]: 'Ví MoMo',
      [PaymentMethod.ZALOPAY]: 'ZaloPay',
      [PaymentMethod.VIETQR]: 'VietQR',
      [PaymentMethod.CASH]: 'Tiền mặt',
    };
    return names[method] || method;
  }

  formatAmount(amount: number, currency: string = 'VND'): string {
    return `${amount.toLocaleString('vi-VN')} ${currency}`;
  }

  // Calculate remaining time
  getTimeRemaining(expiresAt: string): { minutes: number; seconds: number; expired: boolean } {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      return { minutes: 0, seconds: 0, expired: true };
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { minutes, seconds, expired: false };
  }
}

export const qrPaymentAPI = new QRPaymentAPI();
