'use client';

import { useState } from 'react';
import { Button } from 'antd';
import CreateMenuItemModal from '@/src/app/(pages)/admin/menu-items/create';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (data: { name: string; price: number; description: string; available: boolean }) => {
    console.log("Form submitted:", data);
    // TODO: gọi API create menu item
    setIsModalOpen(false);
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between mt-10">
      <h1 className="text-3xl font-bold text-orange-800 mb-2 sm:mb-0 ">Dashboard Overview</h1>
      <Button
        size="large"
        onClick={handleAddNew}
        className="inline-block bg-amber-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-orange-500 transition"
      >
        + Add New Menu Item
      </Button>

      {isModalOpen && (
        <CreateMenuItemModal
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}

    </div>
  );
}
