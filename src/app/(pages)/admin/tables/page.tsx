"use client";

import { useState } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { Table } from "@/src/Types";
import {
  getTablesPaginated,
  createTable,
  updateTable,
  deleteTable,
} from "@/src/lib/api";
import TableTable from "@/src/components/admin/tables/TableTable";
import TableFormModal from "@/src/components/admin/tables/TableFormModal";
import TableDetailsModal from "@/src/components/admin/tables/TableDetailsModal";
import { AdminLayout } from "@/src/components/layout";
import { LoadingSpinner } from "@/src/components/ui";
import AdminPageHeader from "@/src/components/admin/common/AdminPageHeader";
import AdminPagination from "@/src/components/admin/common/AdminPagination";
import { useAdminPagination } from "@/src/hooks/useAdminPagination";
import { Table as TableIcon, Plus } from "lucide-react";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export default function AdminTablesPage() {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Use pagination hook
  const {
    data: tables,
    loading: isLoading,
    search,
    filter: statusFilter,
    handleSearchChange,
    handleFilterChange,
    refetch,
    paginationProps
  } = useAdminPagination({
    fetchFunction: (page, limit, search, filter) => {
      return getTablesPaginated(
        page,
        limit,
        search,
        filter === 'all' ? undefined : filter
      );
    },
    itemsPerPage: ITEMS_PER_PAGE
  });

  if (loading || !user) {
    return (
      <LoadingSpinner size="lg" text="Loading..." className="min-h-screen" />
    );
  }

  if (user.role !== "admin") {
    return <p className="text-center p-12">Not authorized</p>;
  }

  function handleCreate() {
    setSelectedTable(null);
    setModalOpen(true);
  }

  async function handleSave(form: {
    tableName: string;
    location: string;
    status: "available" | "occupied" | "reserved" | "maintenance";
    width?: number;
    height?: number;
  }) {
    setFormLoading(true);
    try {
      console.log('Saving table:', form);
      if (selectedTable) {
        const updated = await updateTable(selectedTable._id, form);
        console.log('Updated table:', updated);
        toast.success("Cập nhật bàn thành công!");
      } else {
        const created = await createTable(form);
        console.log('Created table:', created);
        toast.success("Tạo bàn thành công!");
      }
      // Wait a bit to ensure backend has processed
      await new Promise(resolve => setTimeout(resolve, 500));
      refetch(); // Use refetch from pagination hook
      setModalOpen(false);
      setSelectedTable(null);
    } catch (err: any) {
      console.error('Error saving table:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status
      });
      toast.error(err?.response?.data?.message || err?.message || "Có lỗi xảy ra");
    } finally {
      setFormLoading(false);
    }
  }

  function handleEdit(table: Table) {
    setSelectedTable(table);
    setModalOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteTable(id);
      toast.success("Xóa bàn thành công!");
      refetch(); // Use refetch from pagination hook
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Xóa bàn thất bại");
    }
  }

  function handleView(table: Table) {
    setSelectedTable(table);
    setDetailsModalOpen(true);
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Quản lý bàn"
          description="Quản lý danh sách bàn, vị trí và trạng thái"
          icon={<TableIcon className="w-6 h-6 text-white" />}
          action={
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Thêm bàn mới
            </button>
          }
        />

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <LoadingSpinner size="lg" text="Đang tải danh sách bàn..." className="py-12" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <TableTable
              tables={tables}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
            <AdminPagination {...paginationProps} />
          </div>
        )}

        {/* Create/Edit Modal */}
        {modalOpen && (
          <TableFormModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedTable(null);
            }}
            onSubmit={handleSave}
            initialData={selectedTable}
            loading={formLoading}
          />
        )}

        {/* Details Modal */}
        {detailsModalOpen && selectedTable && (
          <TableDetailsModal
            isOpen={detailsModalOpen}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedTable(null);
            }}
            table={selectedTable}
          />
        )}
      </div>
    </AdminLayout>
  );
}

