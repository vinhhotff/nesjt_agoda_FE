import { api } from './callApi';

// Get loyalty points for current user
export const getMyLoyaltyPoints = async () => {
  try {
    const res = await api.get('/loyalty/my-points');
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('Error fetching my loyalty points:', error);
    throw error;
  }
};

// Get loyalty points for specific user (admin)
export const getUserLoyaltyPoints = async (userId: string) => {
  try {
    const res = await api.get(`/loyalty/user/${userId}`);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error(`Error fetching loyalty points for user ${userId}:`, error);
    throw error;
  }
};

// Get loyalty history for current user
export const getMyLoyaltyHistory = async () => {
  try {
    const res = await api.get('/loyalty/my-points/history');
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('Error fetching my loyalty history:', error);
    throw error;
  }
};

// Get loyalty history for specific user (admin)
export const getUserLoyaltyHistory = async (userId: string) => {
  try {
    const res = await api.get(`/loyalty/user/${userId}/history`);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error(`Error fetching loyalty history for user ${userId}:`, error);
    throw error;
  }
};

// Add points to user (admin)
export const addPointsToUser = async (userId: string, points: number) => {
  try {
    const res = await api.patch(`/loyalty/user/${userId}/add-points`, { points });
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error(`Error adding points to user ${userId}:`, error);
    throw error;
  }
};

// Redeem points from user (admin)
export const redeemPointsFromUser = async (userId: string, points: number) => {
  try {
    const res = await api.patch(`/loyalty/user/${userId}/redeem-points`, { points });
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error(`Error redeeming points from user ${userId}:`, error);
    throw error;
  }
};

// Redeem own points (current user)
export const redeemMyPoints = async (points: number) => {
  try {
    const res = await api.patch('/loyalty/my-points/redeem', { points });
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('Error redeeming my points:', error);
    throw error;
  }
};

// Auto-award points: Mark order as paid (internal use for loyalty system)
const markOrderAsPaidInternal = async (orderId: string, isPaid: boolean) => {
  try {
    const res = await api.patch(`/orders/${orderId}/paid`, { isPaid });
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error(`Error marking order ${orderId} as paid:`, error);
    throw error;
  }
};

// Auto-award points: Update order status to served (internal use for loyalty system)
const updateOrderStatusInternal = async (orderId: string, status: string) => {
  try {
    const res = await api.patch(`/orders/${orderId}/status`, { status });
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};

// Create payment record
export const createPayment = async (paymentData: {
  method: 'cash' | 'QR' | 'card';
  amount: number;
  paidAt?: string;
  user?: string;
  orders?: string[];
}) => {
  try {
    const res = await api.post('/payments', paymentData);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Auto-award workflow: Complete order and award points
export const completeOrderWithPoints = async (orderId: string, userId: string, pointsToAward: number = 0) => {
  try {
    // 1. Mark order as served
    await updateOrderStatusInternal(orderId, 'served');
    
    // 2. Mark order as paid
    await markOrderAsPaidInternal(orderId, true);
    
    // 3. Award points if specified
    if (pointsToAward > 0) {
      await addPointsToUser(userId, pointsToAward);
    }
    
    return { success: true, orderId, pointsAwarded: pointsToAward };
  } catch (error) {
    console.error('Error completing order with points:', error);
    throw error;
  }
};
