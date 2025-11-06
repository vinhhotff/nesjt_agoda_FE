'use client';
import React from "react";
import { useAuth } from "../../Context/AuthContext";
import { useCart } from "../../Context/CartContext";
import { CreateOnlineOrderDto } from "@/src/Types";
import { useCheckoutForm } from "@/src/hooks/useCheckoutForm";
import Modal from "../ui/Modal";
import CustomerDetailsForm from "../checkout/CustomerDetailsForm";
import OrderTypeSelection from "../checkout/OrderTypeSelection";
import VoucherSection from "../checkout/VoucherSection";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: CreateOnlineOrderDto) => void;
}

export default function CheckoutModal({ isOpen, onClose, onSubmit }: Props) {
  const { user } = useAuth();
  const { cartItems, clearCart, getCartTotal } = useCart();
  
  const {
    name,
    phone,
    orderType,
    deliveryAddress,
    voucherCode,
    isSubmitting,
    applyingVoucher,
    voucherError,
    cartTotal,
    discountAmount,
    finalTotal,
    setName,
    setPhone,
    setOrderType,
    setDeliveryAddress,
    setVoucherCode,
    handleApplyVoucher,
    handleSubmit
  } = useCheckoutForm({
    user,
    cartItems,
    getCartTotal,
    clearCart,
    onSuccess: onSubmit,
    onClose
  });


  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Checkout Information"
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <CustomerDetailsForm
          name={name}
          phone={phone}
          onNameChange={setName}
          onPhoneChange={setPhone}
          user={user}
        />

        <OrderTypeSelection
          orderType={orderType}
          deliveryAddress={deliveryAddress}
          onOrderTypeChange={setOrderType}
          onDeliveryAddressChange={setDeliveryAddress}
        />

        <VoucherSection
          voucherCode={voucherCode}
          onVoucherCodeChange={setVoucherCode}
          onApplyVoucher={handleApplyVoucher}
          loading={applyingVoucher}
          error={voucherError}
          cartTotal={cartTotal}
          discountAmount={discountAmount}
          finalTotal={finalTotal}
        />

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
