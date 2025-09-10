"use client";
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { RefreshCw } from 'lucide-react';

import { Order } from '@/src/Types';
import { getOrdersPaginate, updateOrderStatus, deleteOrder, getOrderDetails, markOrderAsPaid, exportOrdersToCSV } from '@/src/lib/api';
import { useAdminPagination } from '@/src/hooks/useAdminPagination';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';
import AdminPagination from '@/src/components/admin/common/AdminPagination';
import OrderFilters from '@/src/components/admin/orders/OrderFilters';
import OrderTable from '@/src/components/admin/orders/OrderTable';
import OrderDetailsModal from '@/src/components/admin/orders/OrderDetailsModal';
import { LoadingSpinner } from '@/src/components/ui';

const ITEMS_PER_PAGE = 10;

const OrdersPage: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Use pagination hook
  const {
    data: orders,
    loading,
    search,
    filter: statusFilter,
    sortBy,
    sortOrder,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    resetFilters,
    refetch,
    paginationProps
  } = useAdminPagination({
    fetchFunction: (page, limit, search, filter, sortBy, sortOrder) => {
      return getOrdersPaginate(
        page,
        limit,
        search,
        filter === 'all' ? undefined : filter,
        sortBy,
        sortOrder
      );
    },
    itemsPerPage: ITEMS_PER_PAGE
  });


  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
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
      refetch();
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
      refetch();
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


  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" text="Loading orders..." className="min-h-screen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminPageHeader
          title="Orders Management"
          description="Manage and track all restaurant orders"
        />

        <OrderFilters
          search={search}
          statusFilter={statusFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          loading={loading}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onReset={resetFilters}
          onRefresh={refetch}
          onExport={handleExportOrders}
        />

        <OrderTable
          orders={orders}
          onStatusUpdate={handleStatusUpdate}
          onMarkAsPaid={handleMarkAsPaid}
          onViewDetails={handleViewDetails}
          onDelete={handleDelete}
        />

        <AdminPagination {...paginationProps} />
      </div>

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
