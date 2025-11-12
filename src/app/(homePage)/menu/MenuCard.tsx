'use client';
import React, { useState, memo } from 'react';
import Image from 'next/image';
import { IMenuItem } from '../../../Types';
import styles from './menu.module.css';
import { useCart } from '../../../Context/CartContext';
import { toast } from 'react-toastify';
import { ShoppingCart, Clock, Star } from 'lucide-react';

interface Props {
  item: IMenuItem;
}

function MenuCard({ item }: Props) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className={`${styles.menuCard} ${!item.available ? 'opacity-75' : ''}`}>
      <div className="relative">
        {imageError ? (
          <div className={`${styles.menuImage} flex items-center justify-center bg-gray-700`}>
            <span className="text-4xl opacity-50">🍽️</span>
          </div>
        ) : (
          <Image
            src={item.images?.[0] || '/default.jpeg'}
            alt={item.name}
            width={300}
            height={180}
            unoptimized
            className={styles.menuImage}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        {!item.available && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm px-3 py-1 bg-red-600 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        
        {item.price > 200000 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
            <Star size={12} className="fill-current" />
            Premium
          </div>
        )}
      </div>
      
      <div className={styles.menuContent}>
        <h3 className={styles.menuTitle}>{item.name}</h3>
        <p className={styles.menuDescription}>
          {item.description || 'Delicious dish prepared with care'}
        </p>
        
        <div className={styles.menuInfo}>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={14} />
            <span>{item.preparationTime || 15} min</span>
          </div>
          {!item.available && (
            <span className={`${styles.menuTag} ${styles.unavailable}`}>
              Unavailable
            </span>
          )}
        </div>
        
        <div className={styles.menuTags}>
          {item.isVegetarian && (
            <span className={`${styles.menuTag} ${styles.vegetarian}`}>
              🌱 Vegetarian
            </span>
          )}
          {item.isVegan && (
            <span className={`${styles.menuTag} ${styles.vegan}`}>
              🌿 Vegan
            </span>
          )}
          {item.tag?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className={`${styles.menuTag} ${styles.allergen}`}>
              {tag}
            </span>
          ))}
          {item.tag && item.tag.length > 2 && (
            <span className="text-xs text-gray-400">
              +{item.tag.length - 2} more
            </span>
          )}
        </div>
        
        <div className={styles.priceAndButton}>
          <p className={styles.menuPrice}>
            {item.price.toLocaleString()} VND
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!item.available || isLoading}
            className={`${styles.addToCartButton} ${isLoading ? 'animate-pulse' : ''}`}
            title={item.available ? 'Add to cart' : 'Item unavailable'}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
            ) : (
              <ShoppingCart size={20} />
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
