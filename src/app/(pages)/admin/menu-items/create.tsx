'use client';
import DragDropImageUploader from '@/src/components/admin/DragDropImageUploader';
import { createMenuItem } from '@/src/lib/api';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export default function CreateMenuItemModal({ onClose, onSubmit }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'appetizer',
        images: [] as string[],
        available: true,
    });
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const categories = [
        { value: 'appetizer', label: '🥗 Appetizer' },
        { value: 'main', label: '🍽️ Main Course' },
        { value: 'dessert', label: '🍰 Dessert' },
        { value: 'beverage', label: '🥤 Beverage' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('available', String(formData.available));

            for (const img of images) {
                const res = await fetch(img);
                const blob = await res.blob();
                formDataToSend.append('images', blob, 'image.png');
            }

            await createMenuItem(formDataToSend);
            toast.success('Menu item created successfully!');
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to create menu item');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-16 p-8 md:p-10 transform transition-all duration-300 border"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                    Add New Menu Item
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Name, Description, Availability */}
                        <div className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium  dark:text-gray-200 mb-1">Item Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Margherita Pizza"
                                    className="w-full px-4 py-2.5 rounded-md border dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium  dark:text-gray-200 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="A brief description of the item..."
                                    className="w-full px-4 py-2.5 rounded-md border dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none text-sm"
                                    rows={4}
                                />
                            </div>

                            {/* Availability */}
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.available}
                                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium dark:text-white ">Item is Available</span>
                            </label>
                        </div>

                        {/* Right Column: Price, Category, Images */}
                        <div className="space-y-6">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium  dark:text-gray-200 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    step={0.01}
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2.5 rounded-md border dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium  dark:text-gray-200 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-md border dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition -sm"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium dark:text-white mb-1">Upload Images</label>
                                <DragDropImageUploader
                                    images={images}
                                    setImages={setImages}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-gray-200 text-sm font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}