import { api } from '@/src/lib/api';

export interface LoyaltyAccount {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyHistory {
  type: string;
  points: number;
  date: string;
}

export interface AddPointsDto {
  points: number;
}

export interface RedeemPointsDto {
  points: number;
}

export interface CreateLoyaltyDto {
  user: string;
  points?: number;
}

class LoyaltyAPI {
  private baseUrl = '/loyalty';

  // User endpoints
  async getMyPoints(): Promise<LoyaltyAccount> {
    const response = await api.get(`${this.baseUrl}/my-points`);
    return response.data;
  }

  async getMyPointsHistory(): Promise<LoyaltyHistory[]> {
    const response = await api.get(`${this.baseUrl}/my-points/history`);
    return response.data;
  }

  async redeemMyPoints(data: RedeemPointsDto): Promise<LoyaltyAccount> {
    const response = await api.patch(`${this.baseUrl}/my-points/redeem`, data);
    return response.data;
  }

  // Admin endpoints
  async getAllLoyaltyAccounts(): Promise<LoyaltyAccount[]> {
    const response = await api.get(`${this.baseUrl}`);
    return response.data;
  }

  async getUserLoyalty(userId: string): Promise<LoyaltyAccount> {
    const response = await api.get(`${this.baseUrl}/users/${userId}`);
    return response.data;
  }

  async addPointsToUser(userId: string, data: AddPointsDto): Promise<LoyaltyAccount> {
    const response = await api.patch(`${this.baseUrl}/users/${userId}/add-points`, data);
    return response.data;
  }

  async redeemUserPoints(userId: string, data: RedeemPointsDto): Promise<LoyaltyAccount> {
    const response = await api.patch(`${this.baseUrl}/users/${userId}/redeem-points`, data);
    return response.data;
  }

  async getUserPointsHistory(userId: string): Promise<LoyaltyHistory[]> {
    const response = await api.get(`${this.baseUrl}/users/${userId}/history`);
    return response.data;
  }

  async createLoyaltyAccount(data: CreateLoyaltyDto): Promise<LoyaltyAccount> {
    const response = await api.post(`${this.baseUrl}`, data);
    return response.data;
  }

  // Utility functions
  calculatePointsFromAmount(amount: number): number {
    return Math.floor(amount / 1000); // 1000 VND = 1 point
  }

  calculateDiscountFromPoints(points: number): number {
    return points * 1000; // 1 point = 1000 VND discount
  }
}

export const loyaltyAPI = new LoyaltyAPI();
