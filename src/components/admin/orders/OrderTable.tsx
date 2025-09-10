import React from 'react';
import { Order, Guest } from '@/src/Types';
import { Eye, Trash2 } from 'lucide-react';
import AdminTable from '../common/AdminTable';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  preparing: 'bg-blue-100 text-blue-800 border-blue-200',
  served: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

interface OrderTableProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, status: string) => void;
  onMarkAsPaid: (orderId: string, isPaid: boolean) => void;
  onViewDetails: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderTable({
  orders,
  onStatusUpdate,
  onMarkAsPaid,
  onViewDetails,
  onDelete
}: OrderTableProps) {
  const headers = ['Order ID', 'Guest', 'Items', 'Total', 'Status', 'Payment', 'Created', 'Actions'];

  const emptyState = (
    <div className="text-gray-400 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
      <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
    </div>
  );

  return (
    <AdminTable headers={headers} emptyState={orders.length === 0 ? emptyState : undefined}>
      {orders.map((order) => (
        <tr key={order._id} className="hover:bg-gray-50">
          <td className="py-4 px-6">
            <span className="font-mono text-sm">#{order._id.slice(-8)}</span>
          </td>
          <td className="py-4 px-6">
            <span className="font-medium">
              {typeof order.guest === 'string' 
                ? order.guest 
                : (order.guest as unknown as Guest)?.guestName || 'N/A'}
            </span>
          </td>
          <td className="py-4 px-6">
            <span className="text-gray-600">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </span>
          </td>
          <td className="py-4 px-6">
            <span className="font-semibold text-green-600">
              {order.totalPrice.toLocaleString()} VND
            </span>
          </td>
          <td className="py-4 px-6">
            <div className="relative">
              <select
                value={order.status}
                onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                className={`appearance-none text-xs font-medium px-2 py-1 rounded-full border cursor-pointer ${statusColors[order.status]} hover:opacity-80`}
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="served">Served</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </td>
          <td className="py-4 px-6">
            <button
              onClick={() => onMarkAsPaid(order._id, !order.isPaid)}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                order.isPaid 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
              title={`Click to mark as ${order.isPaid ? 'unpaid' : 'paid'}`}
            >
              {order.isPaid ? 'Paid' : 'Unpaid'}
            </button>
          </td>
          <td className="py-4 px-6">
            <div className="text-sm">
              <div className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
              <div className="text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
            </div>
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => onViewDetails(order)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(order._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Order"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
