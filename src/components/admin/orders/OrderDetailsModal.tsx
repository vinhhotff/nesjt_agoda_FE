import React from 'react';
import { Order, Guest } from '@/src/Types';
import { User, Calendar, DollarSign } from 'lucide-react';
import { Modal } from '@/src/components/ui';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  preparing: 'bg-blue-100 text-blue-800 border-blue-200',
  served: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPaid: (orderId: string, isPaid: boolean) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export default function OrderDetailsModal({ 
  order, 
  isOpen, 
  onClose, 
  onMarkAsPaid, 
  onUpdateStatus 
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Order Details - #${order._id ? order._id.slice(-8) : 'N/A'}`}
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Guest:</span>
              <span className="font-medium">
                {typeof order.guest === 'string' 
                  ? order.guest 
                  : (order.guest as unknown as Guest)?.guestName || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Created:</span>
              <span className="font-medium">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total:</span>
              <span className="font-semibold text-green-600">
                {order.totalPrice ? order.totalPrice.toLocaleString() : '0'} VND
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                {order.status?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Order Type:</span>
              <span className="font-medium">{order.orderType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Payment Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Order Items</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.item || 'Unknown item'}</p>
                      {item.note && (
                        <p className="text-sm text-gray-500 mt-1">Note: {item.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.quantity || 0} × {item.unitPrice ? item.unitPrice.toLocaleString() : '0'} VND
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.subtotal ? item.subtotal.toLocaleString() : '0'} VND
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No items found</p>
              )}
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Special Instructions</h3>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{order.specialInstructions}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Update Order</h3>
            
            {/* Status Update */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 min-w-[80px]">Status:</label>
              <select
                value={order.status}
                onChange={(e) => {
                  if (order._id) {
                    onUpdateStatus(order._id, e.target.value);
                  }
                }}
                className={`px-3 py-2 border border-gray-300 rounded-md text-sm font-medium cursor-pointer ${statusColors[order.status]} hover:opacity-80`}
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="served">Served</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Payment Update */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 min-w-[80px]">Payment:</label>
              <button
                onClick={() => {
                  if (order._id) {
                    onMarkAsPaid(order._id, !order.isPaid);
                  }
                }}
                disabled={!order._id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  order.isPaid
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                } ${!order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Mark as {order.isPaid ? 'Unpaid' : 'Paid'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
