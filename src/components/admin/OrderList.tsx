import { Order, Guest } from '@/src/Types';
import { FC } from 'react';

interface OrderListProps {
  orders: (Order & { totalAmount?: number })[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}
const statusOptions = ['pending', 'preparing', 'served', 'cancelled'] as const;
type Status = typeof statusOptions[number];
const statusColor: Record<Status,string> = {
  pending: "bg-yellow-100 text-yellow-700",
  preparing: "bg-blue-100 text-blue-700",
  served: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

const OrderList: FC<OrderListProps> = ({ orders, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    {/* Desktop Table */}
    <table className="hidden md:table w-full bg-white rounded-lg shadow">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-3 px-4 text-left">Guest</th>
          <th className="py-3 px-4 text-left">Total</th>
          <th className="py-3 px-4 text-left">Status</th>
          <th className="py-3 px-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((row) => (
          <tr key={row._id} className="border-t hover:bg-gray-50">
            <td className="py-3 px-4">{typeof row.guest === 'string' ? row.guest : (row.guest as unknown as Guest)?.guestName || 'N/A'}</td>
            <td className="py-3 px-4 font-semibold">${row.totalPrice?.toLocaleString() || row.totalAmount?.toLocaleString() || 0}</td>
            <td className="py-3 px-4">
              <span className={`px-2 py-1 text-sm rounded ${statusColor[row.status||'pending']}`}>
                {row.status}
              </span>
            </td>
            <td className="py-3 px-4 text-center space-x-2">
              <button 
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                onClick={() => onEdit(row)}
              >
                Edit
              </button>
              <button 
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                onClick={() => onDelete(row._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Mobile Card List */}
    <div className="grid gap-4 md:hidden">
      {orders.map((row) => (
        <div key={row._id} className="p-4 bg-white rounded-lg shadow border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">
              {typeof row.guest === 'string' ? row.guest : (row.guest as unknown as Guest)?.guestName || 'N/A'}
            </h3>
            <span className={`px-2 py-1 text-xs rounded ${statusColor[row.status||'pending']}`}>
              {row.status}
            </span>
          </div>
          <p className="text-gray-600 mb-3">Total: <span className="font-bold">${row.totalPrice?.toLocaleString() || row.totalAmount?.toLocaleString() || 0}</span></p>
          <div className="flex gap-2">
            <button 
              className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
              onClick={() => onEdit(row)}
            >
              Edit
            </button>
            <button 
              className="flex-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              onClick={() => onDelete(row._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default OrderList;
