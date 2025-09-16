'use client';

import { useState } from 'react';
import { type QRSessionData } from '@/src/lib/api/tableApi';

interface GuestRegistrationProps {
  tableData: QRSessionData;
  onSubmit: (guestInfo: { guestName: string; guestPhone?: string }) => void;
  onBack: () => void;
  loading: boolean;
}

export default function GuestRegistration({ tableData, onSubmit, onBack, loading }: GuestRegistrationProps) {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};

    // Validate name (required)
    if (!guestName.trim()) {
      newErrors.name = 'Vui lòng nhập tên của bạn';
    } else if (guestName.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    // Validate phone (optional but if provided, must be valid)
    if (guestPhone.trim() && !isValidPhoneNumber(guestPhone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    // Basic Vietnamese phone number validation
    const phoneRegex = /^(\+84|0)([3|5|7|8|9])([0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim() || undefined
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Format as Vietnamese phone number
    if (cleaned.startsWith('+84')) {
      return cleaned.slice(0, 12);
    } else if (cleaned.startsWith('84')) {
      return '+' + cleaned.slice(0, 11);
    } else if (cleaned.startsWith('0')) {
      return cleaned.slice(0, 10);
    }
    
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setGuestPhone(formatted);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', color: 'var(--gray-900)' }}>
        Thông tin khách hàng
      </h3>

      {/* Table Info Summary */}
      <div style={{
        padding: 'var(--spacing-md)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-xl)',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--gray-600)' }}>
          Đặt món cho <strong>{tableData.tableName}</strong> - Bàn số {tableData.tableNumber}
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">
          {/* Guest Name - Required */}
          <div className="form-group">
            <label className="form-label">
              Tên của bạn <span style={{ color: 'var(--status-cancelled)' }}>*</span>
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className={`form-input ${errors.name ? 'error' : ''}`}
              autoFocus
              maxLength={50}
            />
            {errors.name && (
              <span className="form-error">{errors.name}</span>
            )}
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)', margin: 'var(--spacing-xs) 0 0 0' }}>
              Tên sẽ được sử dụng để xác nhận đơn hàng
            </p>
          </div>

          {/* Guest Phone - Optional */}
          <div className="form-group">
            <label className="form-label">
              Số điện thoại <span style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-500)' }}>(Tùy chọn)</span>
            </label>
            <input
              type="tel"
              value={guestPhone}
              onChange={handlePhoneChange}
              placeholder="0912 345 678 hoặc +84 912 345 678"
              className={`form-input ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && (
              <span className="form-error">{errors.phone}</span>
            )}
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--gray-600)', margin: 'var(--spacing-xs) 0 0 0' }}>
              Để nhận thông báo về trạng thái đơn hàng
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <div style={{
          padding: 'var(--spacing-md)',
          background: 'color-mix(in srgb, var(--agoda-primary) 5%, white)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
          fontSize: 'var(--font-sm)',
          color: 'var(--gray-600)'
        }}>
          <p style={{ margin: '0 0 var(--spacing-sm) 0', fontWeight: 500, color: 'var(--agoda-primary)' }}>
            🔒 Bảo mật thông tin
          </p>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
            <li>Thông tin chỉ được sử dụng cho đơn hàng này</li>
            <li>Không được chia sẻ với bên thứ ba</li>
            <li>Tự động xóa sau khi hoàn thành phục vụ</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button 
            type="button"
            className="btn ghost"
            onClick={onBack}
            disabled={loading}
          >
            ⬅️ Quay lại
          </button>
          
          <button 
            type="submit"
            className="btn primary large"
            disabled={loading || !guestName.trim()}
            style={{ flex: 1 }}
          >
            {loading ? (
              <span>⏳ Đang đăng ký...</span>
            ) : (
              <span>🍽️ Bắt đầu đặt món</span>
            )}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div style={{ 
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-lg)',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-sm)',
        color: 'var(--gray-600)'
      }}>
        <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--gray-700)' }}>
          💡 Mẹo hữu ích
        </h4>
        <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)' }}>
          <li>Sử dụng tên thật để nhân viên dễ xác nhận</li>
          <li>Cung cấp số điện thoại để nhận thông báo món ăn sẵn sàng</li>
          <li>Có thể tách hóa đơn riêng nếu đặt món cùng bàn</li>
          <li>Gọi nhân viên nếu cần hỗ trợ</li>
        </ul>
      </div>
    </div>
  );
}
