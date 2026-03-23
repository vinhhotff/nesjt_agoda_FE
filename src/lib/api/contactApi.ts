import { api } from './callApi';

// ========== Contact Types ==========
export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'closed';
  replyMessage?: string;
  repliedAt?: string;
  repliedBy?: {
    _id: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactStats {
  total: number;
  pending: number;
  replied: number;
  closed: number;
}

export interface ContactListResponse {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
}

// ========== Public: Create Contact ==========
export const createContact = async (data: CreateContactDto): Promise<Contact> => {
  try {
    const response = await api.post('/contact', data);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
};

// ========== Admin: Get All Contacts ==========
export const getContacts = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ContactListResponse> => {
  try {
    const params: Record<string, any> = { page, limit };
    if (status) params.status = status;

    const response = await api.get('/contact', { params });
    // Handle the backend's ResponseInterceptor wrapping: { statusCode: 200, message: 'Success', data: ... }
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// ========== Admin: Get Contact Stats ==========
export const getContactStats = async (): Promise<ContactStats> => {
  try {
    const response = await api.get('/contact/stats');
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    return { total: 0, pending: 0, replied: 0, closed: 0 };
  }
};

// ========== Admin: Get Single Contact ==========
export const getContact = async (id: string): Promise<Contact> => {
  try {
    const response = await api.get(`/contact/${id}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
};

// ========== Admin: Accept Contact ==========
export const acceptContact = async (id: string): Promise<Contact> => {
  try {
    const response = await api.post(`/contact/${id}/accept`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error accepting contact:', error);
    throw error;
  }
};

// ========== Admin: Reject Contact ==========
export const rejectContact = async (id: string, reason?: string): Promise<Contact> => {
  try {
    const response = await api.post(`/contact/${id}/reject`, { reason });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error rejecting contact:', error);
    throw error;
  }
};

// ========== Admin: Reply to Contact ==========
export const replyContact = async (id: string, replyMessage: string): Promise<Contact> => {
  try {
    const response = await api.post(`/contact/${id}/reply`, { replyMessage });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Error replying to contact:', error);
    throw error;
  }
};

// ========== Admin: Delete Contact ==========
export const deleteContact = async (id: string): Promise<void> => {
  try {
    await api.delete(`/contact/${id}`);
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};
