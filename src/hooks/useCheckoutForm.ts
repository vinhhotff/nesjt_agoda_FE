import { useState, useMemo } from "react";
import { OrderType, CreateOnlineOrderDto } from "@/src/Types";
import { useApplyVoucher } from "./useVouchers";
import { createOnlineOrder } from "@/src/lib/api";
import { toast } from "react-toastify";

interface UseCheckoutFormProps {
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
  cartItems: Array<{
    item: {
      _id: string;
    };
    quantity: number;
  }>;
  getCartTotal: () => number;
  clearCart: () => void;
  onSuccess?: (orderData: CreateOnlineOrderDto) => void;
  onClose?: () => void;
}

export function useCheckoutForm({
  user,
  cartItems,
  getCartTotal,
  clearCart,
  onSuccess,
  onClose
}: UseCheckoutFormProps) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.PICKUP);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voucher management
  const { 
    data: appliedVoucher, 
    loading: applyingVoucher, 
    error: voucherError, 
    apply: applyVoucher, 
    clear: clearVoucher 
  } = useApplyVoucher();

  const cartTotal = useMemo(() => getCartTotal(), [cartItems, getCartTotal]);
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const finalTotal = appliedVoucher ? appliedVoucher.finalTotal : cartTotal;

  const handleApplyVoucher = async () => {
    try {
      if (!voucherCode.trim()) {
        toast.error('Please enter a voucher code');
        return;
      }
      await applyVoucher({ code: voucherCode.trim(), orderTotal: cartTotal });
      toast.success('Voucher applied');
    } catch (e: any) {
      toast.error(e?.message || 'Invalid or expired voucher');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // prevent double submits
    
    if (orderType === OrderType.DELIVERY && !deliveryAddress.trim()) {
      toast.error('Please enter a delivery address for delivery orders.');
      return;
    }

    setIsSubmitting(true);
    
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
      await createOnlineOrder(orderData);
      toast.success("Order placed successfully!");
      
      onSuccess?.(orderData);
      clearCart();
      clearVoucher();
      onClose?.();
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Form state
    name,
    phone,
    orderType,
    deliveryAddress,
    voucherCode,
    isSubmitting,
    
    // Voucher state
    appliedVoucher,
    applyingVoucher,
    voucherError,
    
    // Totals
    cartTotal,
    discountAmount,
    finalTotal,
    
    // Actions
    setName,
    setPhone,
    setOrderType,
    setDeliveryAddress,
    setVoucherCode,
    handleApplyVoucher,
    handleSubmit
  };
}
