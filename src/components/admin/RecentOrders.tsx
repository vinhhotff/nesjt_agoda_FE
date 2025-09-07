import { FC } from 'react';
import { Order, Guest } from '@/src/Types';

interface RecentOrdersProps {
  orders: (Order & { totalAmount?: number })[];
  onView: (order: Order) => void; // Nhận order để xử lý trong cha
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  served: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const RecentOrders: FC<RecentOrdersProps> = ({ orders, onView }) => {
  if (!orders || orders.length === 0) {
    return <p className="text-gray-400 italic">No recent orders found</p>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 text-left">Guest</th>
            <th className="py-2 px-3 text-left">Total</th>
            <th className="py-2 px-3 text-left">Status</th>
            <th className="py-2 px-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t">
              <td className="py-2 px-3">
                {typeof o.guest === 'string' ? o.guest : (o.guest as unknown as Guest)?.guestName || 'N/A'}
              </td>
              <td className="py-2 px-3">${o.totalPrice?.toLocaleString() || o.totalAmount?.toLocaleString() || 0}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-1 rounded text-sm ${statusColor[o.status||'pending'] || 'bg-gray-100 text-gray-700'}`}>
                  {o.status}
                </span>
              </td>
              <td className="py-2 px-3 text-center">
                <button
                  className="text-blue-700 hover:underline"
                  onClick={() => onView(o)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;
