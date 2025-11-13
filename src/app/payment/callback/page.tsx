'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handlePaymentCallback = async () => {
      const orderCode = searchParams.get('orderCode');
      const status = searchParams.get('status');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!orderCode || !status || !orderId) {
        setStatus('error');
        toast.error('Invalid payment callback parameters');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      if (status === 'PAID') {
        try {
          // Call backend to confirm payment and update order status
          const response = await fetch('/api/payment/payos/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId,
              orderCode,
              amount: amount ? parseFloat(amount) : undefined,
            }),
          });

          if (response.ok) {
            setStatus('success');
            toast.success('Payment successful! Your order has been confirmed.');
            
            // Redirect to home or order history after 3 seconds
            setTimeout(() => {
              router.push('/user/home');
            }, 3000);
          } else {
            const errorData = await response.json();
            console.error('Payment confirmation error:', errorData);
            setStatus('error');
            toast.error(errorData.message || 'Payment confirmation failed. Please contact support.');
            setTimeout(() => router.push('/'), 5000);
          }
        } catch (error: any) {
          console.error('Error confirming payment:', error);
          setStatus('error');
          toast.error('Error confirming payment. Please contact support.');
          setTimeout(() => router.push('/'), 5000);
        }
      } else {
        setStatus('error');
        toast.error('Payment was not completed. Please try again.');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handlePaymentCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Payment...
            </h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
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
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your order has been confirmed and payment received.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to home page...
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
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment could not be processed. Please try again.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to home page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}

