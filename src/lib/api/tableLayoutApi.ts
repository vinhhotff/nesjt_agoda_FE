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
  try {
    const response = await api.get('/table-layouts/active');
    
    // Backend controller now returns: layout or null
    // ResponseInterceptor wraps it as: { statusCode, message, data: layout, timestamp }
    // So response.data = { statusCode, message, data: layout, timestamp }
    // And response.data.data = layout (or null)
    
    const unwrapped = unwrapResponse<TableLayout | null>(response);
    
    // unwrapResponse should extract response.data.data (which is layout or null)
    if (unwrapped === null || unwrapped === undefined) {
      return null;
    }
    
    // Check if it's a valid TableLayout object
    if (unwrapped._id || unwrapped.tables || unwrapped.gridCols !== undefined) {
      return unwrapped as TableLayout;
    }
    
    return null;
  } catch (error: any) {
    // API endpoint might not exist yet, return null to use fallback
    const statusCode = error?.response?.status;
    if (statusCode === 404) {
      // 404 means no active layout found, which is valid
      return null;
    }
    console.warn('⚠️ Active layout endpoint error, using fallback:', error?.message);
    return null;
  }
};


