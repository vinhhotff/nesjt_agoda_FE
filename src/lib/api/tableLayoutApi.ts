import { TableLayout } from '@/src/Types';
import { api } from './callApi';

const unwrapResponse = <T>(response: any): T => {
  if (response?.data?.data !== undefined) {
    return response.data.data as T;
  }
  if (response?.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export const fetchTableLayouts = async (): Promise<TableLayout[]> => {
  const response = await api.get('/table-layouts');
  return unwrapResponse<TableLayout[]>(response);
};

export const createTableLayout = async (
  payload: Partial<TableLayout>,
): Promise<TableLayout> => {
  const response = await api.post('/table-layouts', payload);
  return unwrapResponse<TableLayout>(response);
};

export const updateTableLayout = async (
  id: string,
  payload: Partial<TableLayout>,
): Promise<TableLayout> => {
  const response = await api.patch(`/table-layouts/${id}`, payload);
  return unwrapResponse<TableLayout>(response);
};

export const deleteTableLayout = async (id: string): Promise<void> => {
  await api.delete(`/table-layouts/${id}`);
};

export const setActiveTableLayout = async (
  id: string,
): Promise<TableLayout> => {
  const response = await api.patch(`/table-layouts/${id}/activate`, {});
  return unwrapResponse<TableLayout>(response);
};

export const getActiveTableLayout = async (): Promise<TableLayout | null> => {
  const response = await api.get('/table-layouts/active');
  const data = unwrapResponse<TableLayout | null>(response);
  return data ?? null;
};


