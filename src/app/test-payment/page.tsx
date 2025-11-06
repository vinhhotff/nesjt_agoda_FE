'use client';

import { useState } from 'react';
import { qrPaymentAPI, PaymentMethod, type QRPaymentResponse } from '@/src/lib/api/qrPaymentApi';
import '@/src/styles/modules.css';

export default function TestPaymentPage() {
  const [paymentData, setPaymentData] = useState<QRPaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number; expired: boolean } | null>(null);

  // Test different payment methods
  const testPayment = async (method: PaymentMethod) => {
    setLoading(true);
    try {
      const mockPayment = await qrPaymentAPI.createMockQRPayment({
        orderId: `ORDER_${Date.now()}`,
        amount: Math.floor(Math.random() * 500000) + 50000, // 50k - 550k VND
        currency: 'VND',
        method,
        customerName: 'Khách hàng test',
        customerPhone: '0912345678',
        description: 'Test payment for QR ordering'
      });
      
      setPaymentData(mockPayment);
      
      // Start countdown timer
      const timer = setInterval(() => {
        const remaining = qrPaymentAPI.getTimeRemaining(mockPayment.expiresAt);
        setTimeRemaining(remaining);
        
        if (remaining.expired) {
          clearInterval(timer);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Payment test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentSuccess = () => {
    if (paymentData) {
      setPaymentData({
        ...paymentData,
        status: 'completed' as any
      });
      alert('🎉 Payment successful! (Simulated)');
    }
  };

  return (
    <div className="module-container">
      {/* Header */}
      <div className="module-header">
        <h1 className="module-title">
          💳 Test QR Payment System
        </h1>
        <p className="module-subtitle">
          Test các phương thức thanh toán QR code
        </p>
      </div>

      {!paymentData ? (
        // Payment Method Selection
        <div className="form-container">
          <h3 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            Chọn phương thức thanh toán để test:
          </h3>
          
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {Object.values(PaymentMethod).map((method) => (
              <button
                key={method}
                className="stat-card"
                onClick={() => testPayment(method)}
                disabled={loading}
                style={{
                  cursor: 'pointer',
                  border: 'none',
                  background: 'white',
                  textAlign: 'center'
                }}
              >
                <div className="stat-icon" style={{ 
                  background: 'var(--agoda-primary)',
                  margin: '0 auto var(--spacing-md)'
                }}>
                  {qrPaymentAPI.getMethodIcon(method)}
                </div>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>
                  {qrPaymentAPI.getMethodName(method)}
                </h4>
                <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--gray-600)' }}>
                  Test {method.toUpperCase()}
                </p>
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
              <div className="stat-icon" style={{ margin: '0 auto var(--spacing-md)' }}>
                🔄
              </div>
              <p>Đang tạo QR payment...</p>
            </div>
          )}
        </div>
      ) : (
        // Payment QR Display
        <div className="form-container">
          {/* Payment Status */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <div className={`status-badge ${paymentData.status.replace('_', '-')}`} style={{ 
              fontSize: 'var(--font-lg)',
              padding: 'var(--spacing-md) var(--spacing-lg)'
            }}>
              {qrPaymentAPI.getStatusIcon(paymentData.status)} {qrPaymentAPI.getStatusText(paymentData.status)}
            </div>
            
            {timeRemaining && !timeRemaining.expired && (
              <p style={{ 
                margin: 'var(--spacing-md) 0 0 0',
                color: 'var(--status-warning)',
                fontSize: 'var(--font-lg)',
                fontWeight: 600
              }}>
                ⏰ {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
              </p>
            )}
          </div>

          {/* QR Code */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <img 
              src={paymentData.qrCodeDataURL} 
              alt="QR Payment Code"
              style={{ 
                maxWidth: '300px',
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-lg)'
              }}
            />
          </div>

          {/* Payment Info */}
          <div className="item-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="form-grid two-columns">
              <div className="form-group">
                <label className="form-label">Phương thức</label>
                <p>{qrPaymentAPI.getMethodName(paymentData.instructions.title.includes('VietQR') ? PaymentMethod.VIETQR : PaymentMethod.MOMO)}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Số tiền</label>
                <p style={{ fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--agoda-primary)' }}>
                  {qrPaymentAPI.formatAmount(paymentData.amount)}
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Mã thanh toán</label>
                <p style={{ fontFamily: 'monospace', fontSize: 'var(--font-sm)' }}>
                  {paymentData.paymentId}
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Hết hạn lúc</label>
                <p>{new Date(paymentData.expiresAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="item-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h4 style={{ margin: '0 0 var(--spacing-md) 0' }}>
              {paymentData.instructions.title}
            </h4>
            
            <ol style={{ paddingLeft: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
              {paymentData.instructions.steps.map((step, index) => (
                <li key={index} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  {step}
                </li>
              ))}
            </ol>

            {paymentData.instructions.bankInfo && (
              <div style={{
                padding: 'var(--spacing-md)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <h5 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Thông tin tài khoản:</h5>
                <p><strong>Ngân hàng:</strong> {paymentData.instructions.bankInfo.bankName}</p>
                <p><strong>STK:</strong> {paymentData.instructions.bankInfo.accountNumber}</p>
                <p><strong>Chủ TK:</strong> {paymentData.instructions.bankInfo.accountName}</p>
              </div>
            )}

            {paymentData.instructions.notes && (
              <div>
                <h5 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Lưu ý:</h5>
                <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
                  {paymentData.instructions.notes.map((note, index) => (
                    <li key={index} style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)' }}>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
            <button 
              className="btn ghost"
              onClick={() => setPaymentData(null)}
            >
              ⬅️ Thử phương thức khác
            </button>
            
            <button 
              className="btn success"
              onClick={simulatePaymentSuccess}
              disabled={paymentData.status === 'completed'}
            >
              ✅ Simulate thành công
            </button>
          </div>
        </div>
      )}

      {/* Back to QR Order */}
      <div style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
        <a href="/qr-order" className="btn outline">
          📱 Test QR Ordering
        </a>
      </div>
    </div>
  );
}
