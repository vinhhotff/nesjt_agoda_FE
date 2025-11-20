import { api } from './callApi';

export interface Zone {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateZoneDto {
  name: string;
  description?: string;
}

export interface UpdateZoneDto {
  name?: string;
  description?: string;
}

export const getZones = async (): Promise<Zone[]> => {
  const response = await api.get<Zone[]>('/zones');
  return response.data?.data || response.data || [];
};

export const getZone = async (id: string): Promise<Zone> => {
  const response = await api.get<Zone>(`/zones/${id}`);
  return response.data?.data || response.data;
};

export const createZone = async (data: CreateZoneDto): Promise<Zone> => {
  const response = await api.post<Zone>('/zones', data);
  return response.data?.data || response.data;
};

export const updateZone = async (
  id: string,
  data: UpdateZoneDto
): Promise<Zone> => {
  const response = await api.patch<Zone>(`/zones/${id}`, data);
  return response.data?.data || response.data;
};

export const deleteZone = async (id: string): Promise<void> => {
  await api.delete(`/zones/${id}`);
};

