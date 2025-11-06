import { api } from './callApi';

export interface CreatePaymentLinkRequest {
  orderId: string;
  amount: number;
  description?: string;
}

export interface CreatePaymentLinkResponse {
  success: boolean;
  paymentLink?: string;
  paymentLinkId?: string;
  qrCode?: string;
  orderCode?: number;
  message?: string;
}

export const createPayOSPaymentLink = async (
  data: CreatePaymentLinkRequest
): Promise<CreatePaymentLinkResponse> => {
  try {
    console.log('Creating PayOS payment link with data:', data);
    const response = await api.post(
      '/payment/payos/create-link',
      data
    );
    console.log('PayOS API raw response:', response);
    console.log('PayOS API response.data:', response.data);
    
    // Backend ResponseInterceptor wraps response as:
    // { statusCode: 200, message: "Success", data: { success: true, paymentLink: "..." } }
    // So we need to extract response.data.data
    let paymentResponse: CreatePaymentLinkResponse;
    
    if (response.data?.data) {
      // Standard backend response format
      paymentResponse = response.data.data;
    } else if (response.data?.success !== undefined) {
      // Direct response (no wrapper)
      paymentResponse = response.data;
    } else {
      console.error('Unexpected response structure:', response.data);
      throw new Error('Invalid response structure from payment API');
    }
    
    console.log('Extracted payment response:', paymentResponse);
    return paymentResponse;
  } catch (error: any) {
    console.error('Error creating PayOS payment link:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response,
      data: error?.response?.data,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      code: error?.code, // Network error codes like 'ECONNREFUSED', 'ERR_NETWORK', etc.
    });
    
    // Extract error message from various possible locations
    let errorMessage = 'Failed to create payment link';
    
    // Network errors (no response received)
    if (!error?.response) {
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error?.message) {
        errorMessage = `Network error: ${error.message}`;
      } else {
        errorMessage = 'Network error: Unable to connect to payment server.';
      }
    } else {
      // HTTP errors (response received but with error status)
      errorMessage = 
        error?.response?.data?.data?.message ||
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.response?.statusText ||
        error?.message || 
        `Server error (${error.response.status})`;
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const confirmPayOSPayment = async (data: {
  orderId: string;
  orderCode: number;
  amount: number;
}) => {
  try {
    const response = await api.post('/payment/payos/confirm-payment', data);
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};


