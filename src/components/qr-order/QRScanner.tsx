'use client';

import { useState, useRef } from 'react';

interface QRScannerProps {
  onQRScanned: (qrCode: string) => void;
  loading: boolean;
}

export default function QRScanner({ onQRScanned, loading }: QRScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onQRScanned(manualCode.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // In a real app, you'd use a QR code reader library here
      // For now, simulate QR code detection
      const reader = new FileReader();
      reader.onload = (event) => {
        // Simulate QR code extraction from image
        const mockQRCode = generateMockQRCode();
        onQRScanned(mockQRCode);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMockQRCode = () => {
    // Generate a mock QR code for testing
    const mockTableId = '507f1f77bcf86cd799439011';
    const mockTableNumber = Math.floor(Math.random() * 20) + 1;
    
    const qrData = {
      type: 'table',
      tableId: mockTableId,
      tableNumber: mockTableNumber,
      timestamp: Date.now()
    };
    
    return btoa(JSON.stringify(qrData));
  };

  const handleDemoScan = () => {
    const mockQRCode = generateMockQRCode();
    onQRScanned(mockQRCode);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
        <div className="stat-icon" style={{ margin: '0 auto var(--spacing-lg)' }}>
          🔄
        </div>
        <p>Đang xử lý mã QR...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {!isManualMode ? (
        <div>
          {/* QR Scanner Simulation */}
          <div style={{
            width: '300px',
            height: '300px',
            margin: '0 auto var(--spacing-lg)',
            border: '2px dashed var(--gray-300)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gray-50)',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: 'var(--spacing-md)',
              opacity: 0.5
            }}>
              📱
            </div>
            <p style={{ color: 'var(--gray-600)' }}>Hướng camera vào mã QR</p>
            
            {/* Scanning animation */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              right: '10%',
              height: '2px',
              background: 'var(--agoda-primary)',
              animation: 'scanLine 2s infinite'
            }} />
          </div>

          <style jsx>{`
            @keyframes scanLine {
              0% { top: 20%; opacity: 1; }
              50% { top: 70%; opacity: 0.7; }
              100% { top: 20%; opacity: 1; }
            }
          `}</style>

          {/* Alternative Methods */}
          <div className="form-grid" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <button 
              className="btn secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 Chọn ảnh QR từ thiết bị
            </button>
            
            <button 
              className="btn outline"
              onClick={() => setIsManualMode(true)}
            >
              ⌨️ Nhập mã thủ công
            </button>
            
            <button 
              className="btn ghost"
              onClick={handleDemoScan}
            >
              🧪 Demo - Tạo mã test
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Nhập mã QR</h3>
          
          <form onSubmit={handleManualSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label">Mã QR</label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Nhập mã QR từ bàn..."
                className="form-input"
                autoFocus
              />
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)' }}>
                Mã QR thường được in ở giữa bàn hoặc trên menu
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button 
                type="submit" 
                className="btn primary" 
                disabled={!manualCode.trim()}
                style={{ flex: 1 }}
              >
                ✅ Xác nhận
              </button>
              <button 
                type="button" 
                className="btn ghost"
                onClick={() => {
                  setIsManualMode(false);
                  setManualCode('');
                }}
              >
                📱 Quét QR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: 'var(--spacing-xl)', 
        padding: 'var(--spacing-lg)',
        background: 'color-mix(in srgb, var(--agoda-primary) 5%, white)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '500px',
        margin: 'var(--spacing-xl) auto 0'
      }}>
        <h4 style={{ color: 'var(--agoda-primary)', margin: '0 0 var(--spacing-sm) 0' }}>
          💡 Hướng dẫn
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: 'var(--spacing-lg)',
          fontSize: 'var(--font-sm)',
          color: 'var(--gray-600)' 
        }}>
          <li>Tìm mã QR trên bàn (thường ở giữa bàn hoặc trên menu)</li>
          <li>Hướng camera điện thoại vào mã QR</li>
          <li>Chờ hệ thống tự động nhận diện</li>
          <li>Hoặc chụp ảnh/nhập mã thủ công nếu cần</li>
        </ul>
      </div>
    </div>
  );
}
