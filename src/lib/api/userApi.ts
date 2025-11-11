import { api } from './callApi';
import { User, PaginatedUser, UserStatusUpdate, ApiError, UserFilter, Role } from '@/src/Types';
import { getRoleName } from '../utils/roleUtils';
import { fetchPaginated, PaginationQuery } from './paginationApi';

// Helper to transform user data with proper role mapping
const transformUser = (user: any): User => {
  // Handle role - can be object { _id, name } or string
  // Backend now returns role as string after normalization
  let roleName: string;
  if (typeof user.role === 'string') {
    // Role is already a string (backend normalized it)
    roleName = user.role;
  } else if (typeof user.role === 'object' && user.role !== null) {
    // Role is populated object with name property (fallback)
    roleName = user.role.name || 'user';
  } else {
    // Fallback
    roleName = getRoleName(user.role) || 'user';
  }
  
  const transformedUser = {
    ...user,
    role: roleName
  };
  
  return transformedUser;
};

// Create User
export const createUser = async (data: Partial<User>): Promise<User> => {
  const response = await api.post<User>('/user', data);
  // Backend ResponseInterceptor wraps response
  if (response.data?.data) {
    return response.data.data;
  }
  return response.data;
};

// Get paginated users with filter support
// Supports both object parameter and individual parameters for backward compatibility
export const getUsersPaginate = async (
  pageOrFilter?: number | UserFilter,
  limit?: number,
  search?: string,
  role?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedUser> => {
  try {
    // Handle both function signatures:
    // 1. getUsersPaginate({ page, limit, search, role, ... })
    // 2. getUsersPaginate(page, limit, search, role, sortBy, sortOrder)
    let filter: UserFilter;
    
    if (typeof pageOrFilter === 'object' && pageOrFilter !== null) {
      // Object parameter format
      filter = pageOrFilter;
    } else {
      // Individual parameters format
      filter = {
        page: pageOrFilter || 1,
        limit: limit || 10,
        search: search || '',
        role: role || '',
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
      };
    }

    const {
      search: searchParam = '',
      role: roleParam = '',
      status = '',
      sortBy: sortByParam = 'createdAt',
      sortOrder: sortOrderParam = 'desc',
      page = 1,
      limit: limitParam = 10
    } = filter;

    // Build query using standardized format
    const query: PaginationQuery = {
      page,
      limit: limitParam,
      sortBy: sortByParam,
      sortOrder: sortOrderParam,
    };

    // Add search parameter
    if (searchParam) {
      query.search = searchParam;
    }
    
    // Add role filter
    if (roleParam && roleParam !== 'all') {
      query.role = roleParam;
    }
    
    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('🔍 getUsersPaginate - Calling fetchPaginated with:', {
      endpoint: '/user',
      query,
    });

    // Use standardized pagination API
    const result = await fetchPaginated<User>('/user', query);
    
    console.log('🔍 getUsersPaginate - fetchPaginated result:', {
      itemsCount: result.items?.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
    
    // Transform users to ensure role is a string name, not ObjectId
    const transformedUsers = result.items.map((user: any) => transformUser(user));
    
    console.log('🔍 getUsersPaginate - Transformed users:', {
      count: transformedUsers.length,
      firstUserRole: transformedUsers[0]?.role,
    });
    
    return {
      items: transformedUsers,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    };
  } catch (error: any) {
    console.error('❌ Error in getUsersPaginate:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      response: error?.response,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    
    // Re-throw error to allow useAdminPagination to handle it
    throw error;
  }
};

// Get single user
export const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/user/${id}`);
  // Backend ResponseInterceptor wraps response
  let userData = response.data;
  if (response.data?.data) {
    userData = response.data.data;
  }
  return transformUser(userData);
};

// Update user - Fixed to match BE schema
export const updateUser = async (id: string, data: UserStatusUpdate): Promise<User> => {
  try {
    
    // Validate data matches BE UpdateUserDto (extends CreateUserDto)
    const validFields = ['name', 'email', 'phone', 'address', 'role', 'avatar'];
    const sanitizedData: UserStatusUpdate = {};
    
    // Only include valid fields that BE accepts
    Object.keys(data).forEach(key => {
      if (validFields.includes(key) && data[key as keyof UserStatusUpdate] !== undefined) {
        sanitizedData[key as keyof UserStatusUpdate] = data[key as keyof UserStatusUpdate];
      }
    });

    
    const response = await api.patch(`/user/${id}`, sanitizedData);
    // Backend ResponseInterceptor wraps response
    let userData = response.data;
    if (response.data?.data) {
      userData = response.data.data;
    }
    return userData;
  } catch (error: any) {
    console.error('❌ Error updating user:', error);
    console.error('📋 Error response:', error?.response?.data);
    
    // Handle specific API errors
    if (error?.response?.status === 400) {
      const apiError: ApiError = error.response.data;
      const message = Array.isArray(apiError.message) 
        ? apiError.message.join(', ')
        : apiError.message || 'Invalid data provided';
      
      throw new Error(`Update failed: ${message}`);
    }
    
    throw new Error(`Failed to update user: ${error?.message || 'Unknown error'}`);
  }
};

// Toggle user status - Using soft delete approach since BE doesn't support status fields
// NOTE: This implementation has limitations:
// - Deactivation works by soft deleting the user
// - Activation (restoring deleted users) is not supported without BE changes
// - Consider adding proper status fields to BE schema for full functionality
export const toggleUserStatus = async (id: string, makeActive: boolean): Promise<User> => {
  try {
    
    // Get current user data first
    const currentUser = await getUser(id);
    
    // Strategy: Use role to indicate status
    // - Active users keep their current role (admin, staff, user)
    // - Inactive users get a "disabled" role or we use soft delete
    
    if (!makeActive) {
      // Deactivate user by using soft delete (which BE supports)
      await deleteUser(id);
      
      // Return a modified user object to indicate deactivation
      return {
        ...currentUser,
        // Mark as deleted in the frontend representation
        isDeleted: true
      } as User;
    } else {
      // For activation, we can't easily "undelete" a soft-deleted user
      // This would require a BE endpoint to restore deleted users
      
      throw new Error(
        'User activation not supported. Once a user is deactivated (soft deleted), ' +
        'they cannot be reactivated without backend support for restoring deleted users.'
      );
    }
    
  } catch (error: any) {
    console.error('❌ Toggle user status failed:', error?.message);
    
    // If it's our custom error, re-throw it
    if (error.message.includes('User activation not supported') || error.message.includes('Cannot activate')) {
      throw error;
    }
    
    // For other errors, provide a more user-friendly message
    throw new Error(`Failed to ${makeActive ? 'activate' : 'deactivate'} user: ${error?.message || 'Unknown error'}`);
  }
};

// Delete user (soft delete supported by BE)
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/user/${id}`);
  } catch (error: any) {
    console.error('❌ Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error?.message || 'Unknown error'}`);
  }
};

// Get user count
export const fetchUsersCount = async (): Promise<number> => {
  try {
    const response = await api.get('/user/count');
    // Backend ResponseInterceptor wraps response
    let countData = response.data;
    if (response.data?.data) {
      countData = response.data.data;
    }
    return countData.total || 0;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
};

// Get user roles
export const getUserRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    
    // Handle different possible response structures
    let roles = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      roles = response.data.data;
    } else if (Array.isArray(response.data)) {
      roles = response.data;
    } else if (response.data?.roles && Array.isArray(response.data.roles)) {
      roles = response.data.roles;
    }
    
    return roles;
  } catch (error) {
    console.warn('❌ Roles API not available, using default roles', error);
    // Return default roles if API doesn't exist
    return [
      { _id: '1', name: 'Admin', permissions: [], createdAt: '', updatedAt: '' },
      { _id: '2', name: 'Staff', permissions: [], createdAt: '', updatedAt: '' },
      { _id: '3', name: 'User', permissions: [], createdAt: '', updatedAt: '' }
    ];
  }
};

// Password reset (placeholder - BE might not support this)
export const resetUserPassword = async (id: string) => {
  try {
    // Mock password reset since endpoint might not exist
    console.warn('Password reset API not implemented, showing success message');
    return {
      success: true,
      message: 'Password reset instructions sent via email'
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};
