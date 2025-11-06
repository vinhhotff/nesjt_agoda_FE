'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { IMenuItem } from '../Types';

interface CartItem {
  item: IMenuItem;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: IMenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage synchronously on the client side.
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage on init", error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes.
  useEffect(() => {
    try {
      // The check for window is not strictly necessary here since useEffect only runs on the client,
      // but it's good practice for safety.
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);


  const addToCart = useCallback((itemToAdd: IMenuItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.item._id === itemToAdd._id);
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.item._id === itemToAdd._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { item: itemToAdd, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((cartItem) => cartItem.item._id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((cartItem) =>
          cartItem.item._id === itemId ? { ...cartItem, quantity } : cartItem
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, cartItem) => {
      return total + cartItem.item.price * cartItem.quantity;
    }, 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
