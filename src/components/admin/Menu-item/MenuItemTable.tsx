'use client';

import { IMenuItem } from '@/src/Types';
import { Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    items: IMenuItem[];
    onEdit: (item: IMenuItem) => void;
    onDelete: (id: string) => void;
}

function ActionButton({
    onClick,
    children,
    hoverColor,
}: {
    onClick: () => void;
    children: React.ReactNode;
    hoverColor: string;
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`p-2 rounded-lg transition-colors duration-200 ${hoverColor}`}
        >
            {children}
        </motion.button>
    );
}

export default function MenuItemTable({ items, onEdit, onDelete }: Props) {
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
                    {items.length === 0 ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="text-center p-6 text-gray-500 italic"
                            >
                                Không có món nào
                            </td>
                        </tr>
                    ) : (
                        items.map((item, index) => (
                            <motion.tr
                                key={item._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
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
                                <td className="p-4 gap-4">
                                    <ActionButton onClick={() => onEdit(item)} hoverColor="hover:bg-blue-50">
                                        <Pencil className="w-5 h-5 text-blue-600" />
                                    </ActionButton>
                                    <ActionButton onClick={() => onDelete(item._id)} hoverColor="hover:bg-red-50">
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </ActionButton>
                                </td>


                            </motion.tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
