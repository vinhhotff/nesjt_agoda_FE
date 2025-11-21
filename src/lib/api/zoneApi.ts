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
  const response = await api.get<Zone[] | { data: Zone[] }>('/zones');
  const data: unknown = response.data;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data;
  }
  return Array.isArray(data) ? data : [];
};

export const getZone = async (id: string): Promise<Zone> => {
  const response = await api.get<Zone | { data: Zone }>(`/zones/${id}`);
  const data: unknown = response.data;
  if (data && typeof data === 'object' && 'data' in data) {
    return (data as { data: Zone }).data;
  }
  return data as Zone;
};

export const createZone = async (data: CreateZoneDto): Promise<Zone> => {
  const response = await api.post<Zone | { data: Zone }>('/zones', data);
  const responseData: unknown = response.data;
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return (responseData as { data: Zone }).data;
  }
  return responseData as Zone;
};

export const updateZone = async (
  id: string,
  data: UpdateZoneDto
): Promise<Zone> => {
  const response = await api.patch<Zone | { data: Zone }>(`/zones/${id}`, data);
  const responseData: unknown = response.data;
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return (responseData as { data: Zone }).data;
  }
  return responseData as Zone;
};

export const deleteZone = async (id: string): Promise<void> => {
  await api.delete(`/zones/${id}`);
};

