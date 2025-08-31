'use client';
import React from 'react';
import { IMenuItem } from '../../../Types';
import styles from './menu.module.css';
import { useCart } from '../../../Context/CartContext';
import { toast } from 'react-toastify';

interface Props {
  item: IMenuItem;
}

export default function MenuCard({ item }: Props) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (item.available) {
      addToCart(item);
      toast.success(`${item.name} has been added to your cart!`);
    } else {
      toast.error(`${item.name} is currently unavailable.`);
    }
  };

  return (
    <div className={styles.menuCard}>
      <img src={item.images?.[0] || '/default.jpeg'} alt={item.name} className={styles.menuImage} />
      <div className={styles.menuContent}>
        <h3 className={styles.menuTitle}>{item.name}</h3>
        <p className={styles.menuDescription}>{item.description}</p>
        <div className={styles.menuInfo}>
          <span>Prep: {item.preparationTime || 'N/A'} min</span>
          {!item.available && <span className={`${styles.menuTag} ${styles.unavailable}`}>Unavailable</span>}
        </div>
        <div className={styles.menuTags}>
          {item.isVegetarian && <span className={`${styles.menuTag} ${styles.vegetarian}`}>Vegetarian</span>}
          {item.isVegan && <span className={`${styles.menuTag} ${styles.vegan}`}>Vegan</span>}
          {item.allergens?.map((a, idx) => <span key={idx} className={`${styles.menuTag} ${styles.allergen}`}>{a}</span>)}
        </div>
        <div className={styles.priceAndButton}>
          <p className={styles.menuPrice}>{item.price.toLocaleString()} VND</p>
          <button onClick={handleAddToCart} disabled={!item.available} className={styles.addToCartButton}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
