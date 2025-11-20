import { toast as reactToast, ToastOptions, Id } from 'react-toastify';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

// Custom toast configuration với màu vàng/amber theme
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  className: 'custom-toast',
};

// Custom toast với icon và styling đẹp
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return reactToast.success(
      <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>,
      {
        ...defaultOptions,
        ...options,
        className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
        progressClassName: 'bg-green-200',
      }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    return reactToast.error(
      <div className="flex items-center gap-3">
        <XCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>,
      {
        ...defaultOptions,
        autoClose: 4000, // Error hiển thị lâu hơn
        ...options,
        className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
        progressClassName: 'bg-red-200',
      }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    return reactToast.warning(
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>,
      {
        ...defaultOptions,
        ...options,
        className: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg',
        progressClassName: 'bg-yellow-200',
      }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    return reactToast.info(
      <div className="flex items-center gap-3">
        <Info className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>,
      {
        ...defaultOptions,
        ...options,
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
        progressClassName: 'bg-blue-200',
      }
    );
  },

  loading: (message: string, options?: ToastOptions): Id => {
    return reactToast.loading(
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
        <span className="font-medium">{message}</span>
      </div>,
      {
        ...defaultOptions,
        autoClose: false,
        closeButton: false,
        ...options,
        className: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg',
      }
    );
  },

  // Promise toast - tự động chuyển từ loading -> success/error
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return reactToast.promise(
      promise,
      {
        pending: {
          render: () => (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
              <span className="font-medium">{messages.pending}</span>
            </div>
          ),
          className: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg',
        },
        success: {
          render: ({ data }) => (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">
                {typeof messages.success === 'function' 
                  ? messages.success(data as T) 
                  : messages.success}
              </span>
            </div>
          ),
          className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
          progressClassName: 'bg-green-200',
        },
        error: {
          render: ({ data }) => (
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">
                {typeof messages.error === 'function' 
                  ? messages.error(data) 
                  : messages.error}
              </span>
            </div>
          ),
          className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
          progressClassName: 'bg-red-200',
        },
      },
      {
        ...defaultOptions,
        ...options,
      }
    );
  },

  // Update existing toast
  update: (toastId: Id, options: ToastOptions) => {
    reactToast.update(toastId, options);
  },

  // Dismiss toast
  dismiss: (toastId?: Id) => {
    reactToast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    reactToast.dismiss();
  },
};

export default toast;
