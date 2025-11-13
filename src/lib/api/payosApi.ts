import { api } from './callApi';

export interface CreatePaymentLinkRequest {
  orderId: string;
  amount: number;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
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
    // Auto-generate returnUrl and cancelUrl if not provided
    let requestData = { ...data };
    
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      if (!requestData.returnUrl) {
        requestData.returnUrl = `${baseUrl}/payment/success`;
      }
      if (!requestData.cancelUrl) {
        requestData.cancelUrl = `${baseUrl}/payment/cancel`;
      }
    }
    
    console.log('Creating PayOS payment link with data:', requestData);
    const response = await api.post(
      '/payment/payos/create-link',
      requestData
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
    } else if (response.data) {
      // Try to use response.data directly
      paymentResponse = response.data as CreatePaymentLinkResponse;
    } else {
      console.error('Unexpected response structure:', {
        fullResponse: response,
        responseData: response.data,
        responseStatus: response.status,
      });
      throw new Error('Invalid response structure from payment API');
    }
    
    // Validate response has required fields
    if (!paymentResponse.success && !paymentResponse.paymentLink) {
      console.error('Payment response missing required fields:', paymentResponse);
      throw new Error(
        paymentResponse.message || 'Payment link was not returned from server'
      );
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
    
    // Throw error instead of returning error object
    // This allows the calling code to handle it properly with try/catch
    throw new Error(errorMessage);
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


