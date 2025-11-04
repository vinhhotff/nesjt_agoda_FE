import { FC } from 'react';
import { Order, Guest } from '@/src/Types';
import { Clock, CheckCircle2, ChefHat, XCircle, Eye } from 'lucide-react';

interface RecentOrdersProps {
  orders: (Order & { totalAmount?: number })[];
  onView: (order: Order) => void;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
    icon: Clock,
  },
  preparing: {
    label: 'Preparing',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: ChefHat,
  },
  served: {
    label: 'Served',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: XCircle,
  },
};

const RecentOrders: FC<RecentOrdersProps> = ({ orders, onView }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">No recent orders found</p>
        <p className="text-gray-400 text-sm mt-1">Orders will appear here once they are placed</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          <p className="text-sm text-gray-500">Latest orders from customers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Guest
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const status = statusConfig[order.status || 'pending'] || statusConfig.pending;
                const StatusIcon = status.icon;
                const guestName = typeof order.guest === 'string' 
                  ? order.guest 
                  : (order.guest as unknown as Guest)?.guestName || 'N/A';
                const total = order.totalPrice || order.totalAmount || 0;

                return (
                  <tr 
                    key={order._id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                          {guestName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{guestName}</div>
                          <div className="text-xs text-gray-500">
                            ID: {order._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-700 font-medium">
                        {order.items?.length || 0} items
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-lg font-bold text-green-600">
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.bgColor} ${status.color} font-medium text-sm`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{status.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onView(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 hover:shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
