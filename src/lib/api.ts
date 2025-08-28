import axios from "axios";
import Cookies from "js-cookie";

//instance baseURL

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});
interface RegisterResponse {
    success: boolean;
    message: string;
}

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

export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error("Error logging out:", error);
        return null;
    }
}


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