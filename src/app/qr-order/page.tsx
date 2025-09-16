'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { tableAPI, type QRSessionData } from '@/src/lib/api/tableApi';
import QRScanner from '@/src/components/qr-order/QRScanner';
import TableInfo from '@/src/components/qr-order/TableInfo';
import GuestRegistration from '@/src/components/qr-order/GuestRegistration';
import '@/src/styles/modules.css';

type OrderStep = 'scan' | 'table-info' | 'guest-registration' | 'menu-selection';

export default function QROrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [currentStep, setCurrentStep] = useState<OrderStep>('scan');
  const [tableData, setTableData] = useState<QRSessionData | null>(null);
  const [guestInfo, setGuestInfo] = useState<{ guestName: string; guestPhone?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if QR code is provided in URL
  useEffect(() => {
    const qrCode = searchParams.get('qr');
    if (qrCode) {
      handleQRCodeScanned(qrCode);
    }
  }, [searchParams]);

  const handleQRCodeScanned = async (qrCode: string) => {
    try {
      setLoading(true);
      setError(null);      
      // Get table information from QR code
      const sessionData = await tableAPI.getTableByQRCode(qrCode);
      
      setTableData(sessionData);
      setCurrentStep('table-info');
      
    } catch (err: any) {
      setError(err.message || 'Không thể đọc mã QR');
      console.error('QR scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableConfirmed = () => {
    if (!tableData) return;
    
    // Check if table is available
    if (tableData.status === 'maintenance') {
      setError('Bàn này đang được bảo trì, vui lòng chọn bàn khác');
      return;
    }
    
    setCurrentStep('guest-registration');
  };

  const handleGuestRegistered = async (guestData: { guestName: string; guestPhone?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!tableData?.sessionId) {
        throw new Error('Phiên đặt món không hợp lệ');
      }

      // Register guest with the session
      await tableAPI.registerGuest(tableData.sessionId, guestData);
      
      setGuestInfo(guestData);
      
      // Redirect to menu selection
      router.push(`/qr-order/menu?session=${tableData.sessionId}&guest=${encodeURIComponent(guestData.guestName)}&table=${tableData.tableNumber}`);
      
    } catch (err: any) {
      setError(err.message || 'Không thể đăng ký thông tin khách hàng');
      console.error('Guest registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('scan');
    setTableData(null);
    setGuestInfo(null);
    setError(null);
    
    // Clear URL parameters
    router.replace('/qr-order');
  };

  const handleManualTableSelection = () => {
    router.push('/qr-order/tables');
  };

  return (
    <div className="module-container">
      {/* Header */}
      <div className="module-header">
        <h1 className="module-title">
          📱 Đặt món qua QR
        </h1>
        <p className="module-subtitle">
          Quét mã QR trên bàn để bắt đầu đặt món
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          padding: 'var(--spacing-lg)', 
          background: 'color-mix(in srgb, var(--status-cancelled) 10%, white)',
          color: 'var(--status-cancelled)',
          borderLeft: '4px solid var(--status-cancelled)',
          margin: 'var(--spacing-md) 0',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>❌ {error}</span>
            <button 
              onClick={() => setError(null)}
              style={{ 
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--font-lg)',
                color: 'inherit'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <button 
              className="btn outline small"
              onClick={handleStartOver}
            >
              🔄 Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="form-container">
        {/* Step Indicator */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: 'var(--spacing-xl)',
          gap: 'var(--spacing-md)'
        }}>
          <div className={`status-badge ${currentStep === 'scan' ? 'in-progress' : currentStep !== 'scan' ? 'confirmed' : 'pending'}`}>
            📱 1. Quét QR
          </div>
          <div className={`status-badge ${currentStep === 'table-info' ? 'in-progress' : ['guest-registration', 'menu-selection'].includes(currentStep) ? 'confirmed' : 'pending'}`}>
            🍽️ 2. Xác nhận bàn
          </div>
          <div className={`status-badge ${currentStep === 'guest-registration' ? 'in-progress' : currentStep === 'menu-selection' ? 'confirmed' : 'pending'}`}>
            👤 3. Thông tin khách
          </div>
          <div className={`status-badge ${currentStep === 'menu-selection' ? 'in-progress' : 'pending'}`}>
            📋 4. Đặt món
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'scan' && (
          <div style={{ textAlign: 'center' }}>
            <QRScanner 
              onQRScanned={handleQRCodeScanned}
              loading={loading}
            />
            
            <div style={{ marginTop: 'var(--spacing-xl)' }}>
              <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-lg)' }}>
                Hoặc
              </p>
              <button 
                className="btn outline"
                onClick={handleManualTableSelection}
              >
                🏷️ Chọn bàn thủ công
              </button>
            </div>
          </div>
        )}

        {currentStep === 'table-info' && tableData && (
          <TableInfo 
            tableData={tableData}
            onConfirm={handleTableConfirmed}
            onBack={handleStartOver}
            loading={loading}
          />
        )}

        {currentStep === 'guest-registration' && tableData && (
          <GuestRegistration
            tableData={tableData}
            onSubmit={handleGuestRegistered}
            onBack={() => setCurrentStep('table-info')}
            loading={loading}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: 'var(--spacing-xl)',
        color: 'var(--gray-500)',
        fontSize: 'var(--font-sm)'
      }}>
        <p>🔒 Thông tin của bạn được bảo mật và chỉ sử dụng để phục vụ đơn hàng</p>
        
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <button 
            className="btn ghost small"
            onClick={() => router.push('/')}
          >
            🏠 Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
