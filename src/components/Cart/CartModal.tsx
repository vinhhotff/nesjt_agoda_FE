'use client';
import React from 'react';
import { useCart } from '../../Context/CartContext';
import styles from './Cart.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ isOpen, onClose, onCheckout }: Props) {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Your Cart</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.content}>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map(cartItem => (
              <div key={cartItem.item._id} className={styles.cartItem}>
                <img src={cartItem.item.images?.[0] || '/default.jpeg'} alt={cartItem.item.name} />
                <div className={styles.itemDetails}>
                  <p className={styles.itemName}>{cartItem.item.name}</p>
                  <p className={styles.itemPrice}>{cartItem.item.price.toLocaleString()} VND</p>
                </div>
                <div className={styles.quantityControl}>
                  <button onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity - 1)}>-</button>
                  <span>{cartItem.quantity}</span>
                  <button onClick={() => updateQuantity(cartItem.item._id, cartItem.quantity + 1)}>+</button>
                </div>
                <button onClick={() => removeFromCart(cartItem.item._id)} className={styles.removeButton}>Remove</button>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <p>Total:</p>
              <p>{getCartTotal().toLocaleString()} VND</p>
            </div>
            <button className={styles.checkoutButton} onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
