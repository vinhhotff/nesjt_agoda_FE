"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Button from "../Button/Button";
import styles from "./header.module.css";
import { useCart } from "../../Context/CartContext";
import CartModal from "../Cart/CartModal";
import CheckoutModal from "../CheckoutModal/CheckoutModal";
import { createOnlineOrder } from "../../lib/api";
import { CreateOnlineOrderDto, OrderType } from "../../Types";

import { useAuth } from "../../Context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const links = [
  { id: 1, title: "Home", url: "/" },
  { id: 2, title: "Menu", url: "/menu" },
  { id: 3, title: "About", url: "/about" },
  { id: 4, title: "Contact", url: "/contact" },
  { id: 5, title: "Reservation", url: "/reservation" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logout } = useAuth();
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = async (
    customerName: string,
    customerPhone: string
  ) => {
    console.log('Placing order with cart items:', cartItems);
    const orderData: CreateOnlineOrderDto = {
      customerName,
      customerPhone,
      items: cartItems.map((ci) => ({
        item: ci.item._id,
        quantity: ci.quantity,
      })),
      orderType: OrderType.PICKUP,
      user: user?._id,
    };

    try {
      await createOnlineOrder(orderData);
      toast.success("Order placed successfully!");
      clearCart();
      setIsCheckoutOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const handleLogout = () => {
    logout("/");
    setProfileOpen(false);
  };

  return (
    <>
      <div className={`${styles.container} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.logo}>
          <Link href="/">Foodies</Link>
        </div>
        <div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
          {links.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.title}
            </Link>
          ))}


        </div>

        <div className={styles.rightItems}>
          <div className={styles.cartIcon} onClick={() => setIsCartOpen(true)}>
            🛒
            {cartItemCount > 0 && (
              <span className={styles.cartBadge}>{cartItemCount}</span>
            )}
          </div>
          {!user ? (
            <Button url="/login" text="Login" />
          ) : (
            <div className={styles.profileWrapper}>
              {/* Nút profile */}
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={styles.profileButton}
              >
                <img
                  src={user.avatarUrl || "/default-avatar.png"}
                  alt="profile"
                  className={styles.avatar}
                />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className={styles.profileDropdown}>
                  <Link
                    href="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                    className={styles.dropdownItem}
                    onClick={() => setProfileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={styles.dropdownItem}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <div
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleOpenCheckout}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSubmit={(orderData: CreateOnlineOrderDto) =>
          handlePlaceOrder(orderData.customerName, orderData.customerPhone)
        }
      />
    </>
  );
};

export default Header;
