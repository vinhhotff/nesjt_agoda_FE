'use client';
import React, { useState, memo } from 'react';
import Image from 'next/image';
import { IMenuItem } from '../../../Types';
import { useCart } from '../../../Context/CartContext';
import { toast } from 'react-toastify';
import { ShoppingCart, Clock, Star, Flame, Leaf } from 'lucide-react';

interface Props {
  item: IMenuItem;
}

function MenuCard({ item }: Props) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div 
      className={`group relative bg-white rounded-3xl overflow-hidden border border-gray-200 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 ${!item.available ? 'opacity-60' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
            className={`object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
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

        {/* Quick Add Button - Appears on Hover */}
        <div className={`absolute bottom-3 right-3 transition-all duration-300 ${isHovered && item.available ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleAddToCart}
            disabled={!item.available || isLoading}
            className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-xl transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add to cart"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <ShoppingCart size={20} />
            )}
          </button>
        </div>
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

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-yellow-600 transition-colors">
          {item.name}
        </h3>

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

        {/* Price and Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {item.price.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-1">VND</span>
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!item.available || isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <ShoppingCart size={16} />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
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
