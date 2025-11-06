'use client';

import React, { useState } from 'react';
import { CreateReservationDto } from '@/src/lib/api/reservationsApi';
import { X } from 'lucide-react';

interface CreateReservationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateReservationDto) => Promise<void>;
}

export default function CreateReservationModal({
  onClose,
  onSubmit,
}: CreateReservationModalProps) {
  const [formData, setFormData] = useState<CreateReservationDto>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    numberOfGuests: 1,
    reservationDate: '',
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate
    if (!formData.customerName || !formData.customerPhone || !formData.reservationDate) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc');
      setLoading(false);
      return;
    }

    try {
      // Ensure reservationDate is in ISO format
      let reservationDate = formData.reservationDate;
      if (!reservationDate.includes('T')) {
        // If only date, add current time
        const timeString = new Date().toTimeString().slice(0, 5);
        reservationDate = `${reservationDate}T${timeString}:00`;
      } else if (!reservationDate.includes('Z') && !reservationDate.endsWith('00')) {
        // Ensure format is correct
        if (reservationDate.split('T')[1] && !reservationDate.split('T')[1].includes(':')) {
          reservationDate = `${reservationDate.split('T')[0]}T${new Date().toTimeString().slice(0, 5)}:00`;
        }
      }

      const reservationData: CreateReservationDto = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        numberOfGuests: formData.numberOfGuests,
        reservationDate: reservationDate,
        ...(formData.customerEmail && { customerEmail: formData.customerEmail.trim() }),
        ...(formData.specialRequests && { specialRequests: formData.specialRequests.trim() }),
      };

      await onSubmit(reservationData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Tạo đặt bàn mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên khách hàng *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đặt bàn *
              </label>
              <input
                type="datetime-local"
                name="reservationDate"
                value={formData.reservationDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng khách *
              </label>
              <input
                type="number"
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={handleChange}
                required
                min={1}
                max={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yêu cầu đặc biệt
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              placeholder="Ví dụ: Bàn gần cửa sổ, không có đậu phộng..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo...' : 'Tạo đặt bàn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

