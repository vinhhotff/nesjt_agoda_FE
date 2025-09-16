'use client';

import { type QRSessionData, tableAPI } from '@/src/lib/api/tableApi';

interface TableInfoProps {
  tableData: QRSessionData;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function TableInfo({ tableData, onConfirm, onBack, loading }: TableInfoProps) {
  const isTableAvailable = tableData.status === 'available' || tableData.status === 'occupied';
  
  return (
    <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--gray-900)' }}>
        Thông tin bàn
      </h3>

      {/* Table Card */}
      <div className="item-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ textAlign: 'center' }}>
          {/* Table Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto var(--spacing-lg)',
            borderRadius: '50%',
            background: `color-mix(in srgb, ${tableAPI.getStatusColor(tableData.status)} 15%, white)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: tableAPI.getStatusColor(tableData.status)
          }}>
            🍽️
          </div>

          {/* Table Name */}
          <h2 style={{ 
            margin: '0 0 var(--spacing-sm) 0',
            color: 'var(--gray-900)',
            fontSize: 'var(--font-2xl)'
          }}>
            {tableData.tableName}
          </h2>

          {/* Table Number */}
          <p style={{ 
            margin: '0 0 var(--spacing-md) 0',
            color: 'var(--gray-600)',
            fontSize: 'var(--font-lg)'
          }}>
            Bàn số {tableData.tableNumber}
          </p>

          {/* Status Badge */}
          <div className={`status-badge ${tableData.status.replace('_', '-')}`} style={{ 
            marginBottom: 'var(--spacing-lg)',
            fontSize: 'var(--font-base)'
          }}>
            {tableAPI.getStatusIcon(tableData.status)} {tableAPI.getStatusText(tableData.status)}
          </div>
        </div>

        {/* Table Details */}
        <div className="form-grid two-columns" style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Sức chứa</label>
            <p style={{ margin: 0, color: 'var(--gray-700)' }}>
              👥 {tableAPI.formatCapacity(tableData.capacity)}
            </p>
          </div>

          {tableData.location && (
            <div className="form-group">
              <label className="form-label">Vị trí</label>
              <p style={{ margin: 0, color: 'var(--gray-700)' }}>
                📍 {tableData.location}
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <p style={{ 
              margin: 0, 
              color: tableAPI.getStatusColor(tableData.status),
              fontWeight: 500
            }}>
              {tableAPI.getStatusText(tableData.status)}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Thời gian quét</label>
            <p style={{ margin: 0, color: 'var(--gray-700)' }}>
              🕐 {new Date().toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {tableData.status === 'maintenance' && (
        <div style={{ 
          padding: 'var(--spacing-lg)', 
          background: 'color-mix(in srgb, var(--status-warning) 10%, white)',
          color: '#92400e',
          borderLeft: '4px solid var(--status-warning)',
          marginBottom: 'var(--spacing-lg)',
          borderRadius: 'var(--radius-md)'
        }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            ⚠️ Bàn này đang được bảo trì
          </p>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: 'var(--font-sm)' }}>
            Vui lòng chọn bàn khác hoặc liên hệ nhân viên để được hỗ trợ.
          </p>
        </div>
      )}

      {tableData.status === 'occupied' && (
        <div style={{ 
          padding: 'var(--spacing-lg)', 
          background: 'color-mix(in srgb, var(--agoda-primary) 10%, white)',
          color: 'var(--agoda-primary)',
          border: '1px solid color-mix(in srgb, var(--agoda-primary) 30%, white)',
          marginBottom: 'var(--spacing-lg)',
          borderRadius: 'var(--radius-md)'
        }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            👥 Bàn này đã có khách
          </p>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: 'var(--font-sm)' }}>
            Bạn có thể tham gia đặt món chung hoặc yêu cầu tách hóa đơn riêng.
          </p>
        </div>
      )}

      {isTableAvailable && (
        <div style={{ 
          padding: 'var(--spacing-lg)', 
          background: 'color-mix(in srgb, var(--status-confirmed) 10%, white)',
          color: '#065f46',
          border: '1px solid color-mix(in srgb, var(--status-confirmed) 30%, white)',
          marginBottom: 'var(--spacing-lg)',
          borderRadius: 'var(--radius-md)'
        }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            ✅ Bàn sẵn sàng để đặt món
          </p>
          <p style={{ margin: 'var(--spacing-sm) 0 0 0', fontSize: 'var(--font-sm)' }}>
            Nhấn "Tiếp tục" để điền thông tin và bắt đầu đặt món.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
        <button 
          className="btn ghost"
          onClick={onBack}
          disabled={loading}
        >
          ⬅️ Quét lại
        </button>
        
        {isTableAvailable ? (
          <button 
            className="btn primary large"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '⏳ Đang xử lý...' : '➡️ Tiếp tục đặt món'}
          </button>
        ) : (
          <button 
            className="btn outline"
            onClick={onBack}
          >
            🔄 Chọn bàn khác
          </button>
        )}
      </div>

      {/* Additional Info */}
      <div style={{ 
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-sm)',
        color: 'var(--gray-600)'
      }}>
        <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--gray-700)' }}>
          💡 Lưu ý
        </h4>
        <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
          <li>Thông tin cá nhân sẽ được yêu cầu ở bước tiếp theo</li>
          <li>Bạn có thể xem menu và đặt món sau khi đăng ký</li>
          <li>Hóa đơn có thể được tách riêng theo yêu cầu</li>
        </ul>
      </div>
    </div>
  );
}
