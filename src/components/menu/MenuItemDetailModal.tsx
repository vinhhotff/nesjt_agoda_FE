'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IMenuItem, ReviewRating } from '@/src/Types';
import { getAverageRating } from '@/src/lib/api/reviewApi';
import RatingStars from '../reviews/RatingStars';
import ReviewList from '../reviews/ReviewList';
import ReviewForm from '../reviews/ReviewForm';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/src/Context/CartContext';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface MenuItemDetailModalProps {
  item: IMenuItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemDetailModal({
  item,
  isOpen,
  onClose,
}: MenuItemDetailModalProps) {
  const { addToCart } = useCart();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState<ReviewRating | null>(null);
  const [loadingRating, setLoadingRating] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && item._id) {
      fetchRating();
    }
  }, [isOpen, item._id]);

  const fetchRating = async () => {
    try {
      setLoadingRating(true);
      const data = await getAverageRating(item._id);
      setRating(data);
    } catch (error) {
      console.error('Error fetching rating:', error);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleAddToCart = () => {
    if (!item.available) {
      toast.error(`${item.name} is currently unavailable.`);
      return;
    }
    addToCart(item);
    toast.success(`${item.name} has been added to your cart!`);
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Modal */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="bg-gradient-to-br from-white via-amber-50/30 to-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-amber-200/50 bg-white/80 backdrop-blur-sm">
              <div>
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  {item.category}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{item.name}</h2>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                type="button"
                className="p-2 hover:bg-amber-100 rounded-xl transition-all duration-300 hover:rotate-90"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white group">
                  <Image
                    src={item.images?.[0] || '/default.jpeg'}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="space-y-5">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      {!loadingRating && rating && rating.count > 0 ? (
                        <>
                          <RatingStars rating={rating.average} readonly size="lg" />
                          <span className="text-2xl font-bold text-gray-900">
                            {rating.average.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
                          </span>
                        </>
                      ) : loadingRating ? (
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        <span className="text-sm text-gray-500">No reviews yet</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Price</h4>
                    <div className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {item.price.toLocaleString()}
                      <span className="text-xl ml-2">VND</span>
                    </div>
                  </div>

                  {item.description && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Description</h4>
                      <p className="text-gray-700 leading-relaxed">{item.description}</p>
                    </div>
                  )}

                  {item.tag && item.tag.length > 0 && (
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/50">
                      <h4 className="text-sm font-semibold text-gray-600 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.tag.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium border border-amber-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                    type="button"
                    disabled={!item.available}
                    className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-2xl hover:from-amber-600 hover:to-yellow-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {item.available ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-8 pt-8 border-t-2 border-amber-200/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                  {!showReviewForm && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReviewForm(true);
                      }}
                      type="button"
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl hover:from-amber-600 hover:to-yellow-500 transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {showReviewForm && (
                  <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
                    <ReviewForm
                      menuItemId={item._id}
                      menuItemName={item.name}
                      onSuccess={() => {
                        setShowReviewForm(false);
                        fetchRating();
                      }}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 min-h-[200px]">
                  <ReviewList menuItemId={item._id} />
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

