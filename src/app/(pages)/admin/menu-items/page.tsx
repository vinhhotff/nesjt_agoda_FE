'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/Context/AuthContext';
import { IMenuItem, PaginatedMenuItem } from '@/src/Types';
import { getMenuItemsPaginate, updateMenuItem, deleteMenuItem } from '@/src/lib/api';
import AdminMenuHeader from '@/src/components/admin/Menu-item/AdminMenuHeader';
import Pagination from '@/src/components/admin/Menu-item/Pagination';
import MenuItemTable from '@/src/components/admin/Menu-item/MenuItemTable';
import CreateMenuItemModal from './create';

export default function AdminMenuPage() {
  const { user, loading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<IMenuItem | null>(null);
  const [data, setData] = useState<PaginatedMenuItem>({
    items: [],
    total: 0,
    page: 1,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(true);

  // state quản lý trang hiện tại
  const [page, setPage] = useState(1);

  async function loadMenuItems(pageNumber: number = 1) {
    setIsLoading(true);
    const res = await getMenuItemsPaginate(pageNumber, data.limit);
    console.log('API response for menu items:', res); // Dòng này để debug
    setData(res);
    setPage(pageNumber); // cập nhật state page
    setIsLoading(false);
  }

  useEffect(() => {
    loadMenuItems();
  }, []);

  if (loading || !user) return <p className="p-12 text-center">Loading...</p>;
  if (user.role !== 'admin') return <p>Not authorized</p>;

  function handleCreate() {
    setEditItem(null);
    setModalOpen(true);
  }

  function handleSave(form: { name: string; price: number; available: boolean; description: string }) {
    if (editItem) updateMenuItem(editItem._id, form).then(() => loadMenuItems(page));
    else console.log('TODO: call createMenuItem');
    setModalOpen(false);
  }

  function handleEdit(item: IMenuItem) {
    setEditItem(item);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm('Xóa món này?')) deleteMenuItem(id).then(() => loadMenuItems(page));
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <AdminMenuHeader onCreate={handleCreate} />

      {isLoading ? (
        <div className="max-w-4xl mx-auto my-10 p-6 md:p-8 text-center text-lg font-medium text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      ) : (
        <>
          <MenuItemTable items={data.items} onEdit={handleEdit} onDelete={handleDelete} />
          <Pagination
            page={data.page}        // page hiện tại
            total={data.total}      // tổng số món ăn từ API
            limit={data.limit}      // số món mỗi trang
            onPageChange={(p) => loadMenuItems(p)} // gọi API load trang mới
          />
        </>
      )}

      {modalOpen && (
        <CreateMenuItemModal
          onSubmit={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
