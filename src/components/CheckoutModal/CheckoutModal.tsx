'use client';
import React, { useMemo, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useCart } from "../../Context/CartContext";
import styles from "./CheckoutModal.module.css";
import { createOnlineOrder } from "@/src/lib/api";
import { CreateOnlineOrderDto, OrderType } from "@/src/Types";
import { toast } from "react-toastify";
import { useApplyVoucher } from "@/src/hooks/useVouchers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: CreateOnlineOrderDto) => void;
}

export default function CheckoutModal({ isOpen, onClose, onSubmit }: Props) {
  const { user } = useAuth();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.PICKUP);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Voucher state
  const [voucherCode, setVoucherCode] = useState("");
  const { data: appliedVoucher, loading: applyingVoucher, error: voucherError, apply, clear } = useApplyVoucher();

  const cartTotal = useMemo(() => getCartTotal(), [cartItems, getCartTotal]);
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const finalTotal = appliedVoucher ? appliedVoucher.finalTotal : cartTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderType === OrderType.DELIVERY && !deliveryAddress.trim()) {
      toast.error('Please enter a delivery address for delivery orders.');
      return;
    }

    const orderData: CreateOnlineOrderDto = {
      items: cartItems.map((ci) => ({
        item: ci.item._id,
        quantity: ci.quantity,
      })),
      customerName: name,
      customerPhone: phone,
      orderType: orderType,
      deliveryAddress: orderType === OrderType.DELIVERY ? deliveryAddress : undefined,
      user: user?._id,
    };
    try {
      console.log("Placing order with data:", orderData);
      await createOnlineOrder(orderData);
      toast.success("Order placed successfully!");
      onSubmit(orderData);
      clearCart();
      clear(); // reset voucher state
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const onApplyVoucher = async () => {
    try {
      if (!voucherCode.trim()) {
        toast.error('Please enter a voucher code');
        return;
      }
      await apply({ code: voucherCode.trim(), orderTotal: cartTotal });
      toast.success('Voucher applied');
    } catch (e: any) {
      toast.error(e?.message || 'Invalid or expired voucher');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Checkout Information</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {user ? (
            <p>
              Placing order as: <strong>{user.name}</strong> ({user.email})
            </p>
          ) : (
            <p>Please provide your details to place the order.</p>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={!!user}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Order Type</label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  value={OrderType.PICKUP}
                  checked={orderType === OrderType.PICKUP}
                  onChange={() => setOrderType(OrderType.PICKUP)}
                />
                Pickup
              </label>
              <label>
                <input
                  type="radio"
                  value={OrderType.DELIVERY}
                  checked={orderType === OrderType.DELIVERY}
                  onChange={() => setOrderType(OrderType.DELIVERY)}
                />
                Delivery
              </label>
            </div>
          </div>

          {orderType === OrderType.DELIVERY && (
            <div className={styles.formGroup}>
              <label htmlFor="address">Delivery Address</label>
              <input
                type="text"
                id="address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
            </div>
          )}

          {/* Voucher input */}
          <div className={styles.formGroup}>
            <label htmlFor="voucher">Voucher Code</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                id="voucher"
                placeholder="Enter voucher code"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <button type="button" onClick={onApplyVoucher} disabled={applyingVoucher} className={styles.submitButton}>
                {applyingVoucher ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {voucherError && (
              <p style={{ color: 'red', marginTop: 4 }}>{voucherError}</p>
            )}

            {/* Totals */}
            <div className={styles.totalRow}>
              <div>Subtotal:</div>
              <div>{cartTotal.toLocaleString()} VND</div>
            </div>
            <div className={styles.totalRow}>
              <div>Discount:</div>
              <div>- {discountAmount.toLocaleString()} VND</div>
            </div>
            <div className={styles.totalRow}>
              <strong>Final total:</strong>
              <strong>{finalTotal.toLocaleString()} VND</strong>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitButton}>
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
