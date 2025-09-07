"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Download, 
  ChevronDown,
  Calendar,
  Clock,
  User,
  DollarSign
} from 'lucide-react';

import { Order, PaginatedOrder, Guest } from '@/src/Types';
import { getOrdersPaginate, updateOrderStatus, deleteOrder, getOrderDetails, markOrderAsPaid, exportOrdersToCSV } from '@/src/lib/api';

const ITEMS_PER_PAGE = 10;
const ORDER_STATUSES = ['all', 'pending', 'preparing', 'served', 'cancelled'] as const;

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

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose, onMarkAsPaid, onUpdateStatus }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Order Details - #{order._id ? order._id.slice(-8) : 'N/A'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
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
      </div>
    </div>
  );
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrdersPaginate(
        currentPage,
        ITEMS_PER_PAGE,
        search,
        statusFilter === 'all' ? undefined : statusFilter,
        sortBy,
        sortOrder
      );
      setOrders(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, search, statusFilter, sortBy, sortOrder]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      await deleteOrder(orderId);
      toast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const details = await getOrderDetails(order._id);
      setSelectedOrder(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrder(order);
      setShowDetailsModal(true);
    }
  };

  const handleMarkAsPaid = async (orderId: string, isPaid: boolean) => {
    try {
      await markOrderAsPaid(orderId, isPaid);
      toast.success(`Order marked as ${isPaid ? 'paid' : 'unpaid'}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleExportOrders = async () => {
    try {
      const filters = {
        status: statusFilter === 'all' ? undefined : statusFilter,
      };
      await exportOrdersToCSV(filters);
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage and track all restaurant orders</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="totalPrice-desc">Highest Amount</option>
                  <option value="totalPrice-asc">Lowest Amount</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>

              {/* Export */}
              <button
                onClick={handleExportOrders}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              {/* Refresh */}
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Order ID</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Guest</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Items</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Total</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Payment</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Created</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
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
                        onClick={() => handleMarkAsPaid(order._id, !order.isPaid)}
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
                          onClick={() => handleViewDetails(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 border text-sm font-medium rounded-md ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
        onMarkAsPaid={handleMarkAsPaid}
        onUpdateStatus={handleStatusUpdate}
      />
    </div>
  );
};

export default OrdersPage;
