'use client';

import { IMenuItem } from '@/src/Types';
import { Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { toast } from 'react-toastify';

interface Props {
    items: IMenuItem[];
    onEdit: (item: IMenuItem) => void;
    onDelete: (id: string) => void;
}


function ActionButton({
    onClick,
    children,
    hoverColor,
    title,
}: {
    onClick: () => void;
    children: React.ReactNode;
    hoverColor: string;
    title?: string;
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg transition-colors duration-200 ${hoverColor} flex items-center justify-center`}
        >
            {children}
        </motion.button>
    );
}

export default function MenuItemTable({ items, onEdit, onDelete }: Props) {
    const [localItems, setLocalItems] = React.useState(items);

    React.useEffect(() => {
        setLocalItems(items);
    }, [items]);

    const handleDelete = (id: string) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2">
                    <span>Bạn có chắc muốn xóa món này?</span>
                    <div className="flex justify-end gap-2">
                        <button
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => toast.dismiss(id)}
                        >
                            Hủy
                        </button>
                        <button
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={async () => {
                                toast.dismiss(id);
                                try {
                                    await onDelete(id);
                                    setLocalItems((prev) =>
                                        prev.filter((item) => item._id !== id)
                                    );
                                    toast.success('Xóa thành công!');
                                } catch (err: any) {
                                    toast.error(err?.message || 'Xóa thất bại!');
                                }
                            }}
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            )
        );
    };

    return (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="w-full border-collapse bg-white text-sm md:text-base">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-left text-gray-700">
                        <th className="p-4 font-semibold">Tên món</th>
                        <th className="p-4 font-semibold">Giá</th>
                        <th className="p-4 font-semibold">Trạng thái</th>
                        <th className="p-4 font-semibold">Mô tả</th>
                        <th className="p-4 text-center font-semibold">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {localItems.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center p-6 text-gray-500 italic"
                                >
                                    Không có món nào
                                </td>
                            </tr>
                        ) : (
                            localItems.map((item, index) => (
                                <motion.tr
                                    key={item._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                    className="border-t hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                                    <td className="p-4 text-gray-700">
                                        {item.price.toLocaleString()}đ
                                    </td>
                                    <td className="p-4">
                                        {item.available ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Có
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                Hết
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-600 line-clamp-2">
                                        {item.description}
                                    </td>
                                    <td className="p-4 gap-2 justify-center">
                                        <ActionButton
                                            onClick={() => onEdit(item)}
                                            hoverColor="hover:bg-blue-50"
                                            title="Sửa món"
                                        >
                                            <Pencil className="w-5 h-5 text-blue-600" />
                                        </ActionButton>

                                        <ActionButton
                                            onClick={() => handleDelete(item._id)}
                                            hoverColor="hover:bg-red-50"
                                            title="Xóa món"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-600" />
                                        </ActionButton>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
}
