'use client';
import { FC } from 'react';
import { Order, IMenuItem } from '@/src/Types';

interface Guest {
  guestName?: string;
}

interface OrderModalProps {
  order: Order;
  onClose: () => void;
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  served: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const OrderModal: FC<OrderModalProps> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-lg"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4">Order Details</h2>

        <div className="mb-4">
          <p>
            <span className="font-semibold">Guest:</span>{' '}
            {typeof order.guest === 'string'
              ? order.guest
              : order.guest?.guestName || 'N/A'}
          </p>
          <p>
            <span className="font-semibold">Total Amount:</span> ${order.totalAmount?.toLocaleString() || 0}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{' '}
            <span
              className={`px-2 py-1 rounded text-sm ${
                statusColor[order.status || 'pending']
              }`}
            >
              {order.status || 'pending'}
            </span>
          </p>
          <p>
            <span className="font-semibold">Created At:</span>{' '}
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
          </p>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Items:</h3>
            <ul className="list-disc list-inside space-y-1">
              {order.items.map((item, idx) => {
                const menuItemName =
                  typeof item.menuItem === 'string'
                    ? item.menuItem
                    : (item.menuItem as IMenuItem).name;
                const menuItemPrice =
                  typeof item.menuItem === 'string'
                    ? item.price || 0
                    : (item.menuItem as IMenuItem).price;
                return (
                  <li key={idx}>
                    {menuItemName} x {item.quantity} (${menuItemPrice.toLocaleString()})
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="text-right">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
