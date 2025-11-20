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
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
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
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 shadow-inner">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg font-semibold mb-1">No recent orders found</p>
        <p className="text-gray-400 text-sm">Orders will appear here once they are placed</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative group">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          <p className="text-sm text-gray-500">Latest orders from customers</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50">
              <tr>
                <th className="py-5 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Guest
                </th>
                <th className="py-5 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="py-5 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="py-5 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-5 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order, index) => {
                const status = statusConfig[order.status || 'pending'] || statusConfig.pending;
                const StatusIcon = status.icon;
                const guestName = typeof order.guest === 'string' 
                  ? order.guest 
                  : (order.guest as unknown as Guest)?.guestName || 'N/A';
                const total = order.totalPrice || order.totalAmount || 0;

                return (
                  <tr 
                    key={order._id} 
                    className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {guestName.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {guestName}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            ID: {order._id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                        <span className="text-gray-700 font-semibold">
                          {order.items?.length || 0}
                        </span>
                        <span className="text-gray-500 text-sm">items</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${status.bgColor} ${status.color} font-semibold text-sm shadow-sm group-hover:shadow-md transition-all duration-300`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{status.label}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <button
                        onClick={() => onView(order)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
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
