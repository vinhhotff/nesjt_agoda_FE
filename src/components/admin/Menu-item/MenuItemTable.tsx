'use client';

import { IMenuItem } from '@/src/Types';
import { Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { toast } from '@/src/lib/utils/toast';
import { toast as reactToast, Id } from 'react-toastify';

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
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            title={title}
            type="button"
            className={`p-3 rounded-xl transition-all duration-300 ${hoverColor} flex items-center justify-center shadow-md hover:shadow-lg relative z-20 cursor-pointer`}
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
        const toastId = reactToast(
            ({ closeToast }: any) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-center gap-2 text-gray-900">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <span className="font-semibold">Confirm Delete</span>
                    </div>
                    <p className="text-sm text-gray-600">Are you sure you want to delete this item? This action cannot be undone.</p>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            onClick={() => {
                                if (closeToast) closeToast();
                                reactToast.dismiss(toastId);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-md"
                            onClick={async () => {
                                if (closeToast) closeToast();
                                reactToast.dismiss(toastId);
                                const loadingToast = toast.loading('Deleting...');
                                try {
                                    await onDelete(id);
                                    setLocalItems((prev) =>
                                        prev.filter((item) => item._id !== id)
                                    );
                                    toast.dismiss(loadingToast);
                                    toast.success('Item deleted successfully!');
                                } catch (err: any) {
                                    toast.dismiss(loadingToast);
                                    toast.error(err?.message || 'Failed to delete item!');
                                }
                            }}
                        >
                            Delete Now
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                position: 'top-center',
                className: 'min-w-[400px]',
            }
        );
    };

    return (
        <div className="overflow-x-auto rounded-3xl shadow-xl border border-gray-200/50">
            <table className="w-full border-collapse bg-white/80 backdrop-blur-sm text-sm md:text-base">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 text-left text-gray-700">
                        <th className="p-5 font-bold text-xs uppercase tracking-wider">Item Name</th>
                        <th className="p-5 font-bold text-xs uppercase tracking-wider">Price</th>
                        <th className="p-5 font-bold text-xs uppercase tracking-wider">Status</th>
                        <th className="p-5 font-bold text-xs uppercase tracking-wider">Description</th>
                        <th className="p-5 text-center font-bold text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {localItems.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center p-12 text-gray-500"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <span className="text-3xl">🍽️</span>
                                        </div>
                                        <p className="font-semibold">No items found</p>
                                        <p className="text-sm">Add new items to get started</p>
                                    </div>
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
                                    className="group border-t border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-300"
                                >
                                    <td className="p-5 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </td>
                                    <td className="p-5">
                                        <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            {item.price.toLocaleString()}đ
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        {item.available ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-green-100 text-green-700 border-2 border-green-200 shadow-sm">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                Available
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-100 text-red-700 border-2 border-red-200 shadow-sm">
                                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5 text-gray-600 max-w-xs">
                                        <p className="line-clamp-2">{item.description}</p>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <ActionButton
                                                onClick={() => onEdit(item)}
                                                hoverColor="hover:bg-blue-50 border-2 border-blue-200"
                                                title="Edit Item"
                                            >
                                                <Pencil className="w-5 h-5 text-blue-600" />
                                            </ActionButton>

                                            <ActionButton
                                                onClick={() => handleDelete(item._id)}
                                                hoverColor="hover:bg-red-50 border-2 border-red-200"
                                                title="Delete Item"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-600" />
                                            </ActionButton>
                                        </div>
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
