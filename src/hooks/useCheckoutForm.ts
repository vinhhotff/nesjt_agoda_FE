import { useState, useMemo } from "react";
import { OrderType, CreateOnlineOrderDto } from "@/src/Types";
import { useApplyVoucher } from "./useVouchers";
import { createOnlineOrder } from "@/src/lib/api";
import { createPayOSPaymentLink } from "@/src/lib/api/payosApi";
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

    // Validate customer info for guest orders
    if (!user && (!name.trim() || !phone.trim())) {
      toast.error('Please enter your name and phone number.');
      return;
    }

    setIsSubmitting(true);
    
    const orderData: CreateOnlineOrderDto = {
      items: cartItems.map((ci) => ({
        item: ci.item._id,
        quantity: ci.quantity,
      })),
      // Use user data if logged in, otherwise use form input
      customerName: user?.name || name,
      customerPhone: user ? ((user as any).phone || phone) : phone,
      orderType: orderType,
      deliveryAddress: orderType === OrderType.DELIVERY ? deliveryAddress : undefined,
      user: user?._id,  // Backend will use user ID to link order
    };

    try {
      // Step 1: Create order
      const orderResponse = await createOnlineOrder(orderData);
      console.log('Order response:', orderResponse);
      
      // Handle different response structures
      let orderId: string | undefined;
      if (orderResponse?._id) {
        orderId = orderResponse._id;
      } else if (orderResponse?.id) {
        orderId = orderResponse.id;
      } else if ((orderResponse as any)?.data?._id) {
        orderId = (orderResponse as any).data._id;
      } else if (typeof orderResponse === 'string') {
        orderId = orderResponse;
      }
      
      if (!orderId) {
        console.error('Order response structure:', orderResponse);
        throw new Error('Failed to get order ID from response. Please check console for details.');
      }

      console.log('Order created with ID:', orderId);
      toast.success("Order created! Redirecting to payment...");

      // Step 2: Create PayOS payment link
      console.log('Creating PayOS payment link for order:', orderId, 'amount:', finalTotal);
      
      const paymentLinkResponse = await createPayOSPaymentLink({
        orderId,
        amount: finalTotal,
        description: `Order #${orderId}`,
      });

      console.log('Payment link response:', paymentLinkResponse);

      if (!paymentLinkResponse) {
        console.error('Payment link response is null or undefined');
        throw new Error('No response from payment link API. Please check backend connection.');
      }

      if (!paymentLinkResponse.success) {
        const errorMsg = paymentLinkResponse.message || 'Failed to create payment link';
        console.error('Payment link creation failed:', errorMsg, paymentLinkResponse);
        throw new Error(errorMsg);
      }

      if (!paymentLinkResponse.paymentLink) {
        console.error('Payment link response missing paymentLink:', paymentLinkResponse);
        throw new Error('Payment link was not returned from server. Please check backend logs.');
      }

      // Step 3: Redirect to PayOS payment page
      console.log('Redirecting to:', paymentLinkResponse.paymentLink);
      // Don't clear cart yet - wait for payment confirmation
      window.location.href = paymentLinkResponse.paymentLink;
      
      // Note: onSuccess and onClose will be called after payment is confirmed
      // via return URL handler
    } catch (err: any) {
      console.error("Error placing order:", err);
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to place order. Please try again.";
      console.error("Error details:", {
        message: errorMessage,
        error: err,
        response: err?.response,
      });
      toast.error(errorMessage);
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
