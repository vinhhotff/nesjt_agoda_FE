"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { IMenuItem, PaginatedMenuItem } from "@/src/Types";
import {
  getMenuItemsPaginate,
  createMenuItem,
  deleteMenuItem,
} from "@/src/lib/api";
import Pagination from "@/src/components/admin/Menu-item/Pagination";
import MenuItemTable from "@/src/components/admin/Menu-item/MenuItemTable";
import CreateMenuItemModal from "./create";
import EditMenuItemModal from "@/src/components/admin/Menu-item/EditMenuItemModal";
import { AdminLayout } from "@/src/components/layout";
import { LoadingSpinner } from "@/src/components/ui";
import AdminPageHeader from "@/src/components/admin/common/AdminPageHeader";
import { UtensilsCrossed, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminMenuPage() {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [data, setData] = useState<PaginatedMenuItem>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const router = useRouter();

  async function loadMenuItems(pageNumber: number = 1) {
    setIsLoading(true);
    const res = await getMenuItemsPaginate(pageNumber, data.limit);
    setData(res);
    setPage(pageNumber);
    setIsLoading(false);
  }

  useEffect(() => {
    loadMenuItems();
  }, []);

  if (loading || !user) return <LoadingSpinner size="lg" text="Loading..." className="min-h-screen" />;
  if (user.role !== "admin") return <p className="text-center p-12">Not authorized</p>;

  // 👉 mở modal create
  function handleCreate() {
    setModalOpen(true);
  }

  // 👉 lưu item mới
  async function handleSave(form: {
    name: string;
    price: number;
    available: boolean;
    description: string;
  }) {
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', String(form.price));
      fd.append('available', String(form.available));
      fd.append('description', form.description);
      await createMenuItem(fd);
      await loadMenuItems(page);
    } catch (err) {
      console.error(err);
    } finally {
      setModalOpen(false);
    }
  }

  // 👉 mở modal edit
  function handleEdit(item: IMenuItem) {
    setSelectedItemId(item._id);
    setEditModalOpen(true);
  }

  // 👉 đóng modal edit và reload data
  function handleEditSuccess() {
    loadMenuItems(page);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa món này?")) {
      await deleteMenuItem(id);
      loadMenuItems(page);
    }
  }

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Menu Items Management"
          description="Manage your restaurant menu items, prices, and availability"
          icon={<UtensilsCrossed className="w-6 h-6 text-white" />}
          action={
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          }
        />

        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <LoadingSpinner size="lg" text="Loading menu items..." className="py-12" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <MenuItemTable
                items={data.items}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
            <div className="mt-6">
              <Pagination
                page={data.page}
                total={data.total}
                limit={data.limit}
                onPageChange={(p) => loadMenuItems(p)}
              />
            </div>
          </>
        )}

        {/* Create Modal */}
        {modalOpen && (
          <CreateMenuItemModal
            onSubmit={handleSave}
            onClose={() => setModalOpen(false)}
          />
        )}

        {/* Edit Modal */}
        {editModalOpen && selectedItemId && (
          <EditMenuItemModal
            itemId={selectedItemId}
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedItemId(null);
            }}
            onSuccess={handleEditSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
