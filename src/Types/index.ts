// ============================
// User Types
// ============================
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role?: string | { _id: string; name: string };
  phone?: string;
  address?: string;
  isMember?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStatusUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string | { _id: string; name: string };
  avatar?: string;
}

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiError {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ============================
// Guest Types
// ============================
export interface Guest {
  _id: string;
  guestName?: string;
  guestPhone?: string;
  tableCode?: string;
  tableName?: string;
  orders?: string[];
  isPaid?: boolean;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// ============================
// Menu Item Types
// ============================
export interface IMenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  images?: string[];
  available: boolean;
  stock?: number;
  preparationTime?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  tag?: string[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface PaginatedMenuItem {
  items: IMenuItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================
// Order Types
// ============================
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'preparing' | 'served' | 'cancelled';

export interface Order {
  _id: string;
  items: Array<{
    item: string | IMenuItem;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    note?: string;
  }>;
  totalPrice: number;
  status: OrderStatus;
  orderType?: OrderType;
  user?: string | User;
  guest?: string | Guest;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  paid?: boolean;
  isPaid?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================
// Review Types
// ============================
export interface Review {
  _id: string;
  menuItem: string | IMenuItem;
  user?: string | User;
  guestName?: string;
  rating: number;
  comment?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  repliedBy?: {
    _id: string;
    email: string;
    reply: string;
    repliedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface ReviewRating {
  average: number;
  count: number;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface PaginatedReview {
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================
// Table Types
// ============================
export interface Table {
  _id: string;
  tableName: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  zone?: string | Zone;
  location?: string | {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  width?: number;
  height?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Zone {
  _id: string;
  name: string;
  description?: string;
  tables?: Table[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TableLayoutZone {
  _id?: string;
  name: string;
  color?: string;
  bounds?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface TableLayout {
  _id?: string;
  name: string;
  isActive?: boolean;
  gridCols?: number;
  gridRows?: number;
  zones?: TableLayoutZone[];
  tables?: Array<{
    _id?: string;
    tableId?: string;
    tableName: string;
    capacity: number;
    zone?: string;
    width?: number;
    height?: number;
    position?: {
      x: number;
      y: number;
      rotation?: number;
    };
    location?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  backgroundImage?: string;
  description?: string;
  layout?: {
    rows: number;
    cols: number;
    cells: Array<{
      row: number;
      col: number;
      type: 'table' | 'empty' | 'wall';
      tableId?: string;
      tableName?: string;
    }>;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ============================
// Voucher Types
// ============================
export interface Voucher {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  minOrderTotal?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplyVoucherPayload {
  code: string;
  orderTotal: number;
  items?: {
    itemId: string;
    quantity: number;
    price?: number;
  }[];
  userId?: string;
}

export interface ApplyVoucherResponse {
  code: string;
  discountAmount: number;
  finalTotal: number;
  voucherId: string;
  message?: string;
}

export interface PaginatedVoucher {
  items: Voucher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================
// Analytics Types
// ============================
export interface TopSellingItem {
  _id: string;
  name: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
  image?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  count?: number;
  label?: string;
}

export interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  growth: {
    revenue: number;
    orders: number;
  };
  periodComparison: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  pending?: number;
  preparing?: number;
  served?: number;
  cancelled?: number;
  statusDistribution?: StatusDistribution[];
  dailyOrders?: ChartDataPoint[];
  averagePreparationTime?: number;
  peakHours?: Array<{
    hour: number;
    orderCount: number;
  }>;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue?: number;
  customerGrowth?: {
    current: number;
    previous: number;
    change: number;
  };
  topCustomers?: Array<{
    _id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface Section {
  _id: string;
  title: string;
  content: string;
  type?: string;
  url?: string;
  image?: string;
  quote?: string;
  teamMembers?: Array<{
    name: string;
    role: string;
    photo: string;
  }>;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================
// Notification Types
// ============================
export type NotificationType = 
  | 'order_new'
  | 'order_status_changed'
  | 'order_cancelled'
  | 'reservation_new'
  | 'reservation_confirmed'
  | 'reservation_cancelled'
  | 'review_new'
  | 'review_approved'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface INotification {
  _id: string;
  user?: string;
  guestId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: {
    orderId?: string;
    reservationId?: string;
    reviewId?: string;
    [key: string]: any;
  };
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotification {
  data: INotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Alias for backward compatibility (avoid conflict with browser Notification API)
export type Notification = INotification;

// ============================
// Additional Types
// ============================
export interface PaginatedUser {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Payment {
  _id: string;
  order?: string | Order;
  orders?: string[] | Order[];
  amount: number;
  method: string;
  status?: string;
  guest?: string | Guest;
  user?: string | User;
  transactionId?: string;
  paidAt?: string;
  isRefunded?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersApiResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOnlineOrderDto {
  items: Array<{
    item: string;
    quantity: number;
  }>;
  user?: string;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  deliveryAddress?: string;
  specialInstructions?: string;
}
