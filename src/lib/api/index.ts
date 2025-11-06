// Export API utilities
export * from './callApi';

// Export Analytics APIs
export * from './analyticsApi';

// Export Order APIs  
export * from './orderApi';

// Export Loyalty APIs
export * from './loyaltyApi';

// Re-export commonly used functions from the original api file for backward compatibility
export {
  // Auth functions
  login,
  logout,
  register,
  refresh,
  
  // User functions
  createUser,
  getUserPaginate,
  getUser,
  updateUser,
  deleteUser,
  getUsersPaginate,
  toggleUserStatus,
  resetUserPassword,
  getUserRoles,
  fetchUsersCount,
  
  // Guest functions
  createGuest,
  getGuests,
  getGuest,
  updateGuest,
  deleteGuest,
  fetchGuests,
  getGuestCount,
  
  // MenuItem functions  
  getMenuItems,
  getMenuItemsPaginate,
  createMenuItem,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemImages,
  deleteMenuItemImage,
  fetchMenuItems,
  getMenuItemCount,
  
  // Table functions
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  fetchTables,
  getTableCount,
  
  // Payment functions
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  fetchPayments,
  getPaymentCount,
  getRevenue,
  
  // About functions
  getAbout,
  
  // Dashboard functions
  getDashboardStats,
  
  // Role utilities
  getRoleName,
  getRoleId,
  getRoleDisplay,
  findRoleById,
  getRoleNameWithFallback,
  
  // Export utilities  
  exportRevenueReport
} from '../api';
