import { ApiError } from '@/src/Types';

// User-friendly error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Error type detection
export const getErrorType = (error: any): keyof typeof ERROR_MESSAGES => {
  if (!error) return 'UNKNOWN_ERROR';
  
  const status = error?.response?.status || error?.status;
  
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
    case 403:
      return 'UNAUTHORIZED';
    case 404:
      return 'NOT_FOUND';
    case 500:
    case 502:
    case 503:
      return 'SERVER_ERROR';
    default:
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
        return 'NETWORK_ERROR';
      }
      return 'UNKNOWN_ERROR';
  }
};

// Extract user-friendly message from API error
export const getErrorMessage = (error: any): string => {
  try {
    // Check if it's an API error with detailed message
    if (error?.response?.data) {
      const apiError: ApiError = error.response.data;
      
      if (apiError.message) {
        if (Array.isArray(apiError.message)) {
          return apiError.message.join(', ');
        }
        return apiError.message;
      }
    }
    
    // Check direct error message
    if (error?.message) {
      return error.message;
    }
    
    // Fallback to generic message based on error type
    const errorType = getErrorType(error);
    return ERROR_MESSAGES[errorType];
  } catch {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Create user-friendly error object
export interface UserFriendlyError {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
  retryable: boolean;
}

export const createUserFriendlyError = (error: any): UserFriendlyError => {
  const errorType = getErrorType(error);
  const message = getErrorMessage(error);
  
  switch (errorType) {
    case 'NETWORK_ERROR':
      return {
        title: 'Connection Problem',
        message,
        type: 'warning',
        code: 'NETWORK_ERROR',
        retryable: true,
      };
    
    case 'UNAUTHORIZED':
      return {
        title: 'Access Denied',
        message,
        type: 'error',
        code: 'UNAUTHORIZED',
        retryable: false,
      };
      
    case 'NOT_FOUND':
      return {
        title: 'Not Found',
        message,
        type: 'info',
        code: 'NOT_FOUND',
        retryable: false,
      };
      
    case 'BAD_REQUEST':
    case 'VALIDATION_ERROR':
      return {
        title: 'Invalid Input',
        message,
        type: 'warning',
        code: 'VALIDATION_ERROR',
        retryable: false,
      };
      
    case 'SERVER_ERROR':
      return {
        title: 'Server Problem',
        message,
        type: 'error',
        code: 'SERVER_ERROR',
        retryable: true,
      };
      
    default:
      return {
        title: 'Unexpected Error',
        message,
        type: 'error',
        code: 'UNKNOWN_ERROR',
        retryable: true,
      };
  }
};

// Toast notification helper (assuming you use react-toastify or similar)
export const showErrorToast = (error: any, customMessage?: string) => {
  const friendlyError = createUserFriendlyError(error);
  const message = customMessage || friendlyError.message;
  
  // If you have toast library installed, use it here
  console.error(`❌ ${friendlyError.title}: ${message}`);
  
  // You can replace this with actual toast implementation
  if (typeof window !== 'undefined' && (window as any).toast) {
    (window as any).toast.error(`${friendlyError.title}: ${message}`);
  }
  
  return friendlyError;
};

// Success toast helper
export const showSuccessToast = (message: string, title?: string) => {
  
  if (typeof window !== 'undefined' && (window as any).toast) {
    (window as any).toast.success(`${title || 'Success'}: ${message}`);
  }
};

// Generic API call wrapper with error handling
export const handleApiCall = async <T>(
  apiCall: () => Promise<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  } = {}
): Promise<T | null> => {
  const {
    successMessage,
    errorMessage,
    showSuccessToast: showSuccess = false,
    showErrorToast: showError = true,
  } = options;
  
  try {
    const result = await apiCall();
    
    if (showSuccess && successMessage) {
      showSuccessToast(successMessage);
    }
    
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    
    if (showError) {
      showErrorToast(error, errorMessage);
    }
    
    return null;
  }
};

// Retry logic for failed API calls
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Only retry on network errors or server errors
      const errorType = getErrorType(error);
      if (errorType !== 'NETWORK_ERROR' && errorType !== 'SERVER_ERROR') {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw lastError;
};
