import axios from "axios";
import Cookies from "js-cookie";
import { OrderType, PaginatedMenuItem } from "../Types";
import { CreateOnlineOrderDto } from "../Types";

//instance baseURL

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});
interface RegisterResponse {
    success: boolean;
    message: string;
}
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
    console.log("Fetching menu items with URL:", `/menu-items/paginate?page=${page}&limit=${limit}&${qs}`);
    if (!res.data || !res.data.data)
      throw new Error("Failed to fetch menu items");
  
    return {
      items: res.data.data.results || [],
      total: res.data.data.total || res.data.data.results.length,
      page: page,
      limit: limit,
    };
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

/* --------------------               
        About             
---------------------- */

export const getAbout = async () => {   
    
        const response = await api.get('/about');
        console.log("Fetched about data:", response.data);
        return response.data.data;
    
};