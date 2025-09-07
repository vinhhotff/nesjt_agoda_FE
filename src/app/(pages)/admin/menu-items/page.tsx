"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/src/Context/AuthContext";
import { IMenuItem, PaginatedMenuItem } from "@/src/Types";
import {
  getMenuItemsPaginate,
  createMenuItem,
  deleteMenuItem,
} from "@/src/lib/api";
import AdminMenuHeader from "@/src/components/admin/Menu-item/AdminMenuHeader";
import Pagination from "@/src/components/admin/Menu-item/Pagination";
import MenuItemTable from "@/src/components/admin/Menu-item/MenuItemTable";
import CreateMenuItemModal from "./create";
import EditMenuItemModal from "@/src/components/admin/Menu-item/EditMenuItemModal";
import Aside from "@/src/components/admin/Aside";
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

  if (loading || !user) return <p className="p-12 text-center">Loading...</p>;
  if (user.role !== "admin") return <p>Not authorized</p>;

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
      await createMenuItem(form);
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
    <div className="flex h-screen">
      {/* Aside */}
      <aside className="w-68 bg-gray-900 text-white p-4">
        <Aside />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
        <AdminMenuHeader onCreate={handleCreate} />

        {isLoading ? (
          <div className="my-10 p-6 md:p-8 text-center text-lg font-medium text-gray-600 dark:text-gray-300">
            Loading...
          </div>
        ) : (
          <>
            <MenuItemTable
              items={data.items}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <Pagination
              page={data.page}
              total={data.total}
              limit={data.limit}
              onPageChange={(p) => loadMenuItems(p)}
            />
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
      </main>
    </div>
  );
}
