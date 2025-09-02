
'use client';
import { getMenuItem, updateMenuItem, uploadMenuItemImages, deleteMenuItemImage } from '@/src/lib/api';
import { IMenuItem } from '@/src/Types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DragDropImageUploader from '@/src/components/admin/DragDropImageUploader';

export default function EditMenuItemPage() {
    const [menuItem, setMenuItem] = useState<IMenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'appetizer',
        available: true,
    });
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [initialImages, setInitialImages] = useState<string[]>([]);

    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        const fetchMenuItem = async () => {
            try {
                const item = await getMenuItem(id);
                setMenuItem(item);
                setFormData({
                    name: item.name,
                    description: item.description ?? '',
                    price: String(item.price),
                    category: item.category,
                    available: item.available,
                });
                console.log(setFormData)
                setImages(item.images || []); 
                setInitialImages(item.images || []);
            } catch (error) {
                toast.error('Failed to fetch menu item');
                router.push('/admin/menu-items');
            }
        };
        if (id) {
            fetchMenuItem();
        }
    }, [id, router]);

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
            const updatedData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                available: formData.available,
            };
            await updateMenuItem(id, updatedData);

            // Image deletion
            const deletedImages = initialImages.filter(img => !images.includes(img));
            for (const imgUrl of deletedImages) {
                const filename = imgUrl.split('/').pop();
                if (filename) {
                    await deleteMenuItemImage(id, filename);
                }
            }

            // Image uploading
            const newImages = images.filter(img => img.startsWith('data:image'));
            if (newImages.length > 0) {
                const imageFiles = await Promise.all(newImages.map(async (base64, index) => {
                    const res = await fetch(base64);
                    const blob = await res.blob();
                    return new File([blob], `image-${index}.png`, { type: 'image/png' });
                }));
                await uploadMenuItemImages(id, imageFiles);
            }

            toast.success('Menu item updated successfully!');
            router.push('/admin/menu-items');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update menu item');
        } finally {
            setLoading(false);
        }
    };

    if (!menuItem) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto my-10 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                Edit Menu Item
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Name, Description, Availability */}
                    <div className="space-y-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-200 mb-1">Item Name</label>
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
                            <label className="block text-sm font-medium dark:text-gray-200 mb-1">Description</label>
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
                            <span className="text-sm font-medium dark:text-white">Item is Available</span>
                        </label>
                    </div>

                    {/* Right Column: Price, Category, Images */}
                    <div className="space-y-6">
                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-200 mb-1">Price ($)</label>
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
                            <label className="block text-sm font-medium dark:text-gray-200 mb-1">Category</label>
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
                        onClick={() => router.push('/admin/menu-items')}
                        className="px-5 py-2.5 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 text-sm font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Item'}
                    </button>
                </div>
            </form>
        </div>
    );
}
