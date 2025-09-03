import axios from "axios";
import { Guest, IMenuItem, Order, PaginatedMenuItem, PaginatedUser, Payment, Table, User } from "../Types";
import { CreateOnlineOrderDto } from "../Types";

//instance baseURL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

interface RegisterResponse {
  success: boolean;
  message: string;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const res = await api.get("/auth/refresh");
        const newToken = res.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config); // retry request
      } catch (err) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/* --------------------               
        Auth             
---------------------- */
export const login = async (email: string, password: string) => {
  const data = { email, password }
  const response = await api.post('/auth/login', data);
  return response
}

export const refresh = () => api.get('/auth/refresh');

export const register = async (name: string, email: string, password: string): Promise<RegisterResponse> => {
  try {
    const response = await api.post("/auth/register", { name, email, password });
    return { success: true, message: "Register successful" };
  } catch (error: any) {
    console.error("Error during registration:", error);
    return { success: false, message: error?.response?.data?.message || "Register failed" };
  }
};

export const logout = async (): Promise<boolean> => {
  try {
    await api.post("/auth/logout");
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
};

/* --------------------
        User
---------------------- */
export const createUser = async (data: Partial<User>) => {
  const res = await api.post<User>('/users', data);
  return res.data;
};

export const getUserPaginate = async (
  page: number = 1,
  limit: number = 10,
  qs: string = ""
): Promise<PaginatedUser> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (qs) params.append("qs", qs);

  const res = await api.get(`/user?${params.toString()}`);
  if (!res.data) throw new Error("Failed to fetch users");

  const { results, meta } = res.data;

  return {
    items: results || [],
    total: meta?.total || results.length,
    page: meta?.page || page,
    limit: meta?.limit || limit,
    totalPages: meta?.totalPages || 1,
  };
};

export const getUser = async (id: string) => {
  const res = await api.get<User>(`/users/${id}`);
  return res.data;
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const res = await api.patch<User>(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete<void>(`/users/${id}`);
  return res.data;
};

/* --------------------
        Guest
---------------------- */
export const createGuest = async (data: { tableName: string; guestName: string }) => {
  const res = await api.post<Guest>('/guests', data);
  return res.data;
};

export const getGuests = async (params?: Record<string, unknown>) => {
  const res = await api.get<Guest[]>('/guests', { params });
  return res.data;
};

export const getGuest = async (id: string) => {
  const res = await api.get<Guest>(`/guests/${id}`);
  return res.data;
};

export const updateGuest = async (id: string, data: Partial<Guest>) => {
  const res = await api.patch<Guest>(`/guests/${id}`, data);
  return res.data;
};

export const deleteGuest = async (id: string) => {
  const res = await api.delete<void>(`/guests/${id}`);
  return res.data;
};

/* --------------------
        MenuItem
---------------------- */
// Hàm lấy danh sách menuitem
export const getMenuItems = async () => {
  try {
    const response = await api.get('/menu-items'); // Endpoint GET /api/v1/menuitem
    return response.data.data; // Trả về data (array món ăn)
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    throw error; // Ném lỗi để xử lý ở frontend
  }
};

export const getMenuItemsPaginate = async (
  page: number = 1,
  limit: number = 10,
  qs: string = ""
): Promise<PaginatedMenuItem> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (qs) params.append("qs", qs);

  const res = await api.get(`/menu-items/paginate?${params.toString()}`);
  if (!res.data || !res.data.data)
    throw new Error("Failed to fetch menu items");

  return {
    items: res.data.data.results || [],
    total: res.data.data.total || res.data.data.results.length,
    page: page,
    limit: limit,
  };
};
export const createMenuItem = async (data: FormData) => {
  const res = await api.post<IMenuItem>('/menu-items', data);
  return res.data;
};

export const getMenuItem = async (id: string) => {
  const res = await api.get<IMenuItem>(`/menu-items/${id}`);
  return res.data;
};

export const updateMenuItem = async (id: string, data: Partial<IMenuItem>) => {
  const res = await api.patch<IMenuItem>(`/menu-items/${id}`, data);
  return res.data;
};

export const deleteMenuItem = async (id: string) => {
  const res = await api.delete<void>(`/menu-items/${id}`);
  return res.data;
};
export const uploadMenuItemImages = async (id: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await api.post(`/menu-items/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteMenuItemImage = async (id: string, filename: string) => {
  await api.delete(`/menu-items/${id}/images/${filename}`);
};
/* --------------------               
        Order
---------------------- */
export const createOnlineOrder = async (orderData: CreateOnlineOrderDto) => {
  try {
    const response = await api.post('/orders/online', orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating online order:", error);
    throw error;
  }
};

export const createOrder = async (data: Partial<Order>): Promise<Order> => {
  const response = await api.post<Order>("/orders", data);
  return response.data;
};

export const getOrders = async (params?: Record<string, unknown>): Promise<Order[]> => {
  const response = await api.get<Order[]>("/orders", { params });
  return response.data;
};

export const getOrder = async (id: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

export const updateOrder = async (id: string, data: Partial<Order>): Promise<Order> => {
  const response = await api.patch<Order>(`/orders/${id}`, data);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};

/* --------------------
        Table
---------------------- */
export const getTables = async (params?: Record<string, unknown>): Promise<Table[]> => {
  const response = await api.get<Table[]>("/tables", { params });
  return response.data;
};

export const getTable = async (id: string): Promise<Table> => {
  const response = await api.get<Table>(`/tables/${id}`);
  return response.data;
};

export const createTable = async (data: Partial<Table>): Promise<Table> => {
  const response = await api.post<Table>("/tables", data);
  return response.data;
};

export const updateTable = async (id: string, data: Partial<Table>): Promise<Table> => {
  const response = await api.patch<Table>(`/tables/${id}`, data);
  return response.data;
};

export const deleteTable = async (id: string): Promise<void> => {
  await api.delete(`/tables/${id}`);
};

/* --------------------
        Payment
---------------------- */
export const getPayments = async (params?: Record<string, unknown>): Promise<Payment[]> => {
  const response = await api.get<Payment[]>("/payments", { params });
  return response.data;
};

export const getPayment = async (id: string): Promise<Payment> => {
  const response = await api.get<Payment>(`/payments/${id}`);
  return response.data;
};

export const createPayment = async (data: Partial<Payment>): Promise<Payment> => {
  const response = await api.post<Payment>("/payments", data);
  return response.data;
};

export const updatePayment = async (id: string, data: Partial<Payment>): Promise<Payment> => {
  const response = await api.patch<Payment>(`/payments/${id}`, data);
  return response.data;
};

export const deletePayment = async (id: string): Promise<void> => {
  await api.delete(`/payments/${id}`);
};

/* --------------------               
        About             
---------------------- */
export const getAbout = async () => {
  const response = await api.get('/about');
  console.log("Fetched about data:", response.data);
  return response.data.data;
};

// ============================
// DASHBOARD STATS - Fixed to use consistent API instance
// ============================
export async function getTodayStats() {
  const res = await api.get("/analytics/today");
  return res.data;
}

export async function getWeeklyTrends() {
  const res = await api.get("/analytics/weekly-trends");
  return res.data;
}

/* --------------------
Admin Dashboard API Calls - All using the same API instance
---------------------- */

export const fetchTables = async () => {
  try {
    const response = await getTables({});
    return response ?? [];
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};

export const fetchOrders = async () => {
  try {
    const response = await getOrders({});
    return response ?? [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const fetchPayments = async () => {
  try {
    const response = await getPayments({});
    return response ?? [];
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
};

export const fetchMenuItems = async () => {
  try {
    const response = await getMenuItems();
    return response ?? [];
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
};

export const fetchGuests = async () => {
  try {
    const response = await getGuests({});
    return response ?? [];
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
};

export const fetchUsers = async () => {
  try {
    const response = await getUserPaginate(1, 10, "");
    return response;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { items: [], total: 0, page: 1, limit: 10 };
  }
};

// ============================
//      DASHBOARD COUNTS 
// ============================

// Đếm số menu items - sử dụng endpoint nhất quán
export const getMenuItemCount = async (): Promise<number> => {
  try {
    const res = await api.get("/menu-items/count");
    return res.data.total || res.data.count || 0;
  } catch (error) {
    console.error("Error fetching menu item count:", error);
    // Fallback: lấy tất cả và đếm
    try {
      const items = await getMenuItems();
      return items?.length || 0;
    } catch (fallbackError) {
      console.error("Fallback count failed:", fallbackError);
      return 0;
    }
  }
};

// Đếm số orders - sử dụng endpoint nhất quán
export const getOrderCount = async (): Promise<number> => {
  try {
    const res = await api.get("/orders/count");
    return res.data.total || res.data.count || 0;
  } catch (error) {
    console.error("Error fetching order count:", error);
    // Fallback: lấy tất cả và đếm
    try {
      const orders = await getOrders({});
      return orders?.length || 0;
    } catch (fallbackError) {
      console.error("Fallback count failed:", fallbackError);
      return 0;
    }
  }
};

// Đếm số users - sử dụng API đã có
export const fetchUsersCount = async (): Promise<number> => {
  try {
    const res = await api.get(`/user?page=1&limit=1`);
    if (!res.data) throw new Error("Failed to fetch users");
    return res.data.meta?.total || 0;
  } catch (error) {
    console.error("Error fetching user count:", error);
    return 0;
  }
};

// Tổng doanh thu - sử dụng endpoint nhất quán
export const getRevenue = async (): Promise<number> => {
  try {
    const res = await api.get("/payments/revenue");
    return res.data.revenue || res.data.total || 0;
  } catch (error) {
    console.error("Error fetching revenue:", error);
    // Fallback: tính từ tất cả payments
    try {
      const payments = await getPayments({});
      return payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    } catch (fallbackError) {
      console.error("Fallback revenue calculation failed:", fallbackError);
      return 0;
    }
  }
};

// Đếm số tables
export const getTableCount = async (): Promise<number> => {
  try {
    const res = await api.get("/tables/count");
    return res.data.total || res.data.count || 0;
  } catch (error) {
    console.error("Error fetching table count:", error);
    // Fallback: lấy tất cả và đếm
    try {
      const tables = await getTables({});
      return tables?.length || 0;
    } catch (fallbackError) {
      console.error("Fallback count failed:", fallbackError);
      return 0;
    }
  }
};

// Đếm số guests
export const getGuestCount = async (): Promise<number> => {
  try {
    const res = await api.get("/guests/count");
    return res.data.total || res.data.count || 0;
  } catch (error) {
    console.error("Error fetching guest count:", error);
    // Fallback: lấy tất cả và đếm
    try {
      const guests = await getGuests({});
      return guests?.length || 0;
    } catch (fallbackError) {
      console.error("Fallback count failed:", fallbackError);
      return 0;
    }
  }
};

// Đếm số payments
export const getPaymentCount = async (): Promise<number> => {
  try {
    const res = await api.get("/payments/count");
    return res.data.total || res.data.count || 0;
  } catch (error) {
    console.error("Error fetching payment count:", error);
    // Fallback: lấy tất cả và đếm
    try {
      const payments = await getPayments({});
      return payments?.length || 0;
    } catch (fallbackError) {
      console.error("Fallback count failed:", fallbackError);
      return 0;
    }
  }
};
// api.ts

export const getDashboardStats = async () => {
  const [
    menuItemCount,
    orderCount,
    userCount,
    revenue,
    tableCount,
    guestCount,
    paymentCount,
    todayStats,
    weeklyTrends,
  ] = await Promise.all([
    getMenuItemCount(),
    getOrderCount(),
    fetchUsersCount(),
    getRevenue(),
    getTableCount(),
    getGuestCount(),
    getPaymentCount(),
    getTodayStats(),
    getWeeklyTrends(),
  ]);

  return {
    menuItemCount,
    orderCount,
    userCount,
    revenue,
    tableCount,
    guestCount,
    paymentCount,
    todayStats,
    weeklyTrends,
  };
};
