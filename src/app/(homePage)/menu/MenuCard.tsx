'use client';
import React, { useState, memo, useEffect } from 'react';
import Image from 'next/image';
import { IMenuItem } from '../../../Types';
import { useCart } from '../../../Context/CartContext';
import { toast } from 'react-toastify';
import { ShoppingCart, Clock, Star, Flame, Leaf, Eye } from 'lucide-react';
import MenuItemDetailModal from '../../../components/menu/MenuItemDetailModal';
import { getAverageRating } from '../../../lib/api/reviewApi';

interface Props {
  item: IMenuItem;
}

function MenuCard({ item }: Props) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);

  const handleAddToCart = async () => {
    if (!item.available) {
      toast.error(`${item.name} is currently unavailable.`);
    } else {
      try {
        setIsLoading(true);
        addToCart(item);
        toast.success(`${item.name} has been added to your cart!`);
      } catch (error) {
        toast.error('Failed to add item to cart. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    setShowDetailModal(true);
  };

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const ratingData = await getAverageRating(item._id);
        setRating(ratingData);
      } catch (error) {
        // Silently fail - reviews are optional
        console.debug('No reviews found for menu item:', item._id);
      }
    };

    fetchRating();
  }, [item._id]);

  return (
    <div 
      className={`group relative bg-white rounded-3xl overflow-hidden border border-gray-200 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer ${!item.available ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 pointer-events-none">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">🍽️</span>
          </div>
        ) : (
          <Image
            src={item.images?.[0] || '/default.jpeg'}
            alt={item.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.price > 200000 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-full text-xs font-bold shadow-lg">
              <Star size={14} className="fill-current" />
              <span>Premium</span>
            </div>
          )}
          {item.isVegetarian && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
              <Leaf size={14} />
              <span>Veggie</span>
            </div>
          )}
          {item.isVegan && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-semibold shadow-lg">
              <Leaf size={14} />
              <span>Vegan</span>
            </div>
          )}
        </div>

        {/* Unavailable Overlay */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="px-4 py-2 bg-red-500 text-white rounded-full font-semibold text-sm shadow-xl">
                Out of Stock
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">
            {item.category}
          </span>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock size={14} />
            <span>{item.preparationTime || 15}m</span>
          </div>
        </div>

        {/* Title and Rating */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-yellow-600 transition-colors flex-1">
            {item.name}
          </h3>
          {rating && rating.count > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg flex-shrink-0">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              <span className="text-sm font-bold text-amber-700">{rating.average.toFixed(1)}</span>
              <span className="text-xs text-amber-600">({rating.count})</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {item.description || 'Delicious dish prepared with care and the finest ingredients'}
        </p>

        {/* Tags */}
        {item.tag && item.tag.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tag.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {item.tag.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{item.tag.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price and View Details */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {item.price.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-1">VND</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-yellow-600 font-semibold text-sm">
            <Eye size={18} />
            <span>View Details</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <MenuItemDetailModal
        item={item}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}

function propsAreEqual(prev: Props, next: Props) {
  const p = prev.item;
  const n = next.item;
  return (
    p._id === n._id &&
    p.price === n.price &&
    p.available === n.available &&
    p.name === n.name &&
    (p.images?.[0] || '') === (n.images?.[0] || '')
  );
}

export default memo(MenuCard, propsAreEqual);
