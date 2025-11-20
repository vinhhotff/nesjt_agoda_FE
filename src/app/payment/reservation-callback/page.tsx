'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { confirmPayOSPayment } from '@/src/lib/api/payosApi';
import { reservationsAPI } from '@/src/lib/api/reservationsApi';

function ReservationCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePaymentCallback = async () => {
      const orderCode = searchParams.get('orderCode');
      const paymentStatus = searchParams.get('status');
      const reservationId = searchParams.get('reservationId');
      const amount = searchParams.get('amount');

      if (!orderCode || !paymentStatus || !reservationId) {
        setStatus('error');
        setMessage('Thông tin thanh toán không hợp lệ');
        toast.error('Thông tin thanh toán không hợp lệ');
        setTimeout(() => router.push('/reservation'), 3000);
        return;
      }

      if (paymentStatus === 'PAID') {
        try {
          // Xác nhận payment với PayOS
          await confirmPayOSPayment({
            orderId: reservationId,
            orderCode: parseInt(orderCode),
            amount: amount ? parseFloat(amount) : 300000,
          });

          // Lấy reservation data từ localStorage
          const pendingReservation = localStorage.getItem('pending_reservation');
          if (!pendingReservation) {
            throw new Error('Không tìm thấy thông tin đặt bàn');
          }

          const { reservationData } = JSON.parse(pendingReservation);

          // Tạo reservation sau khi payment thành công
          await reservationsAPI.createReservationPublic(reservationData);

          // Xóa pending reservation
          localStorage.removeItem('pending_reservation');

          setStatus('success');
          setMessage('Thanh toán thành công! Đặt bàn của bạn đã được xác nhận.');
          toast.success('Thanh toán thành công! Đặt bàn của bạn đã được xác nhận.');
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } catch (error: any) {
          console.error('Error processing reservation payment:', error);
          setStatus('error');
          setMessage(error.message || 'Có lỗi xảy ra khi xử lý đặt bàn. Vui lòng liên hệ hỗ trợ.');
          toast.error(error.message || 'Có lỗi xảy ra khi xử lý đặt bàn. Vui lòng liên hệ hỗ trợ.');
          setTimeout(() => router.push('/reservation'), 5000);
        }
      } else {
        setStatus('error');
        setMessage('Thanh toán chưa được hoàn tất. Vui lòng thử lại.');
        toast.error('Thanh toán chưa được hoàn tất. Vui lòng thử lại.');
        localStorage.removeItem('pending_reservation');
        setTimeout(() => router.push('/reservation'), 3000);
      }
    };

    handlePaymentCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang xử lý thanh toán...
            </h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-4">
              {message || 'Đặt bàn của bạn đã được xác nhận.'}
            </p>
            <p className="text-sm text-gray-500">
              Đang chuyển hướng về trang chủ...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Thanh toán thất bại
            </h2>
            <p className="text-gray-600 mb-4">
              {message || 'Thanh toán không thể được xử lý. Vui lòng thử lại.'}
            </p>
            <p className="text-sm text-gray-500">
              Đang chuyển hướng về trang đặt bàn...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReservationCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải...</h2>
          <p className="text-gray-600">Vui lòng đợi...</p>
        </div>
      </div>
    }>
      <ReservationCallbackContent />
    </Suspense>
  );
}




