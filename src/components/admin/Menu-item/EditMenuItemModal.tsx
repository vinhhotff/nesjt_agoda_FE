'use client';

import { useEffect, useState } from 'react';
import { IMenuItem } from '@/src/Types';
import { getMenuItem, updateMenuItem, uploadMenuItemImages, deleteMenuItemImage } from '@/src/lib/api';
import { toast } from 'react-toastify';
import { X, Upload, Trash2 } from 'lucide-react';
import DragDropImageUploader from '../DragDropImageUploader';

interface EditMenuItemModalProps {
    itemId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMenuItemModal({ itemId, isOpen, onClose, onSuccess }: EditMenuItemModalProps) {
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
    const [fetchLoading, setFetchLoading] = useState(false);

    const categories = [
        { value: 'appetizer', label: '🥗 Appetizer' },
        { value: 'main', label: '🍽️ Main Course' },
        { value: 'dessert', label: '🍰 Dessert' },
        { value: 'beverage', label: '🥤 Beverage' },
    ];

    useEffect(() => {
        if (isOpen && itemId) {
            fetchMenuItem();
        }
    }, [isOpen, itemId]);

    const fetchMenuItem = async () => {
        try {
            setFetchLoading(true);
            
            const item = await getMenuItem(itemId);
            
            setMenuItem(item);
            // Don't set formData here - let the sync useEffect handle it
            
        } catch (error: any) {
            console.error('❌ Failed to fetch menu item:', error);
            toast.error(`Failed to fetch menu item: ${error?.message || 'Unknown error'}`);
            onClose();
        } finally {
            setFetchLoading(false);
        }
    };
    
    // 🔧 FIX: Sync formData when menuItem changes
    useEffect(() => {
        if (menuItem) {
            
            setFormData({
                name: menuItem.name || '',
                description: menuItem.description ?? '',
                price: String(menuItem.price) || '0',
                category: menuItem.category || 'appetizer',
                available: menuItem.available ?? true,
            });
            
            setImages(menuItem.images || []);
            setInitialImages(menuItem.images || []);
            
          
        }
    }, [menuItem]); // Only run when menuItem changes

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
            
            
            // Call PATCH endpoint to update menu item
            const updatedItem = await updateMenuItem(itemId, updatedData);

            // Handle image deletion
            const deletedImages = initialImages.filter(img => !images.includes(img));
            if (deletedImages.length > 0) {
                for (const imgUrl of deletedImages) {
                    const filename = imgUrl.split('/').pop();
                    if (filename) {
                        await deleteMenuItemImage(itemId, filename);
                    }
                }
            }

            // Handle image uploading
            const newImages = images.filter(img => img.startsWith('data:image'));
            if (newImages.length > 0) {
                const imageFiles = await Promise.all(newImages.map(async (base64, index) => {
                    const res = await fetch(base64);
                    const blob = await res.blob();
                    return new File([blob], `image-${index}.png`, { type: 'image/png' });
                }));
                await uploadMenuItemImages(itemId, imageFiles);
            }

            toast.success('Menu item updated successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('❌ Failed to update menu item:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update menu item');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMenuItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'appetizer',
            available: true,
        });
        setImages([]);
        setInitialImages([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] m-4 overflow-hidden border border-amber-100">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Edit Menu Item
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    {fetchLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500"></div>
                            <div className="text-lg text-gray-600">Loading menu item data...</div>
                            <div className="text-sm text-gray-500">ID: {itemId}</div>
                        </div>
                    ) : menuItem ? (
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Name, Description, Availability */}
                                <div className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Item Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Margherita Pizza"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-sm"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="A brief description of the item..."
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none text-sm"
                                            rows={4}
                                        />
                                    </div>

                                    {/* Availability */}
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.available}
                                            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                            className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Item is Available
                                        </span>
                                    </label>
                                </div>

                                {/* Right Column: Price, Category, Images */}
                                <div className="space-y-6">
                                    {/* Price */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min={0}
                                            step={0.01}
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-sm"
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-sm"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Images
                                        </label>
                                        <DragDropImageUploader
                                            images={images}
                                            setImages={setImages}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-amber-100">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:from-amber-300 disabled:to-yellow-300 text-white text-sm font-medium transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : 'Update Item'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-lg text-gray-500">
                                No menu item data found
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
