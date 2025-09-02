// Backend Model Types
export interface Guest {
  _id: string;
  tableName: string;
  guestName: string;
  phoneNumber?: string;
  orders: Order[];
  payment: Payment[];
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  guest: string | Guest;
  items: {
    menuItem: string | IMenuItem;
    quantity: number;
    price?: number;
  }[];
  totalAmount: number;
  status?: "pending" | "cancelled" | "preparing" | "served";
  createdAt: string;
  updatedAt: string;
}

export interface IMenuItem {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  price: number;
  available: boolean;
  category: string;
  preparationTime?: number;
  tag?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Matches the backend DTO
export enum OrderType {
  DINE_IN = "DINE_IN",
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
}

class OrderItemDto {
  item!: string; // MenuItem ID
  quantity!: number;
  note?: string;
}

export class CreateOnlineOrderDto {
  items!: OrderItemDto[];
  customerName!: string;
  customerPhone!: string;
  orderType!: OrderType;
  deliveryAddress?: string;
  specialInstructions?: string;
  user?: string; // Optional: if the user is logged in
}

export interface Payment {
  _id: string;
  guest: string | Guest;
  amount: number;
  method: "cash" | "QR" | "card";
  status?: "pending" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  _id: string;
  tableName: string;
  status: "available" | "occupied";
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: "ADMIN" | "STAFF" | "USER" | "admin" | "staff" | "user";
  createdAt?: string;
  updatedAt?: string;
}

// Frontend Types
export interface OrderItem {
  menuItem: IMenuItem;
  quantity: number;
}

export interface CartItem extends OrderItem {
  _tempId?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginAdmin: (credentials: {
    email: string;
    password: string;
  }) => Promise<boolean>;
  loginStaff: (credentials: {
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

export interface GuestOrderContextType {
  cart: CartItem[];
  addToCart: (item: IMenuItem, quantity: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  submitOrder: (guestId: string) => Promise<boolean>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface GuestFormData {
  tableName: string;
  guestName: string;
}

export interface MenuItemFormData {
  name: string;
  price: number;
  description: string;
  available: boolean;
  category?: string;
}

export interface TableFormData {
  tableName: string;
  status: "available" | "occupied";
}

export interface PaymentFormData {
  guest: string;
  amount: number;
  method: "cash" | "QR" | "card";
}

export type Role = "ADMIN" | "STAFF" | "GUEST";

export type Section =
  | {
      type: "text";
      title: string;
      content: string;
      order: number;
    }
  | {
      type: "image";
      title: string;
      url: string;
      order: number;
    }
  | {
      type: "team";
      title: string;
      teamMembers: { name: string; role: string; photo: string }[];
      order: number;
    }
  | {
      type: "quote";
      quote: string;
      order: number;
    }
  | {
      type: "video";
      title: string;
      url: string;
      order: number;
    };

export interface PaginatedMenuItem {
  items: IMenuItem[];
  total: number;
  page: number;
  limit: number;
}
export interface PaginatedUser {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
