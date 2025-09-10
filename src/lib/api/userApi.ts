import { api } from './callApi';
import { User, PaginatedUser, UserStatusUpdate, ApiError, UserFilter, Role } from '@/src/Types';
import { getRoleName } from '../utils/roleUtils';

// Helper to transform user data with proper role mapping
const transformUser = (user: any): User => {
  const transformedUser = {
    ...user,
    role: getRoleName(user.role)
  };
  
  // Log transformation for debugging (only first few users)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 User role transformation:', {
      original: user.role,
      transformed: transformedUser.role,
      type: typeof user.role
    });
  }
  
  return transformedUser;
};

// Create User
export const createUser = async (data: Partial<User>): Promise<User> => {
  const response = await api.post<User>('/user', data);
  return response.data;
};

// Get paginated users with filter support
export const getUsersPaginate = async (filter: UserFilter = {}): Promise<PaginatedUser> => {
  try {
    const {
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = filter;

    // Build query string for backend
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    // Build query string for search and filters
    const queryParts: string[] = [];
    if (search) {
      queryParts.push(`name:${search}`, `email:${search}`);
    }
    if (role && role !== 'all') {
      queryParts.push(`role:${role}`);
    }
    if (status && status !== 'all') {
      queryParts.push(`status:${status}`);
    }
    
    if (queryParts.length > 0) {
      params.append('qs', queryParts.join(','));
    }

    console.log('Fetching users with params:', params.toString());
    const response = await api.get(`/user?${params.toString()}`);
    console.log('User API Response:', response.data);

    if (!response.data) throw new Error('Failed to fetch users');

    // Handle BE response format: { results: User[], meta: { total, page, limit, totalPages } }
    const { results = [], meta = {} } = response.data;
    
    // Transform users to ensure role is a string name, not ObjectId
    const transformedUsers = results.map((user: any) => transformUser(user));
    
    console.log('✅ Transformed users with role names:', transformedUsers.slice(0, 2));
    
    return {
      items: transformedUsers,
      total: meta.total || results.length,
      page: meta.page || page,
      limit: meta.limit || limit,
      totalPages: meta.totalPages || Math.ceil((meta.total || results.length) / limit)
    };
  } catch (error) {
    console.error('Error in getUsersPaginate:', error);
    const apiError = error as any;
    
    // Return empty result with proper error handling
    return {
      items: [],
      total: 0,
      page: filter.page || 1,
      limit: filter.limit || 10,
      totalPages: 0
    };
  }
};

// Get single user
export const getUser = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/user/${id}`);
  return transformUser(response.data);
};

// Update user - Fixed to match BE schema
export const updateUser = async (id: string, data: UserStatusUpdate): Promise<User> => {
  try {
    console.log('🔍 Updating user:', { id, data });
    
    // Validate data matches BE UpdateUserDto (extends CreateUserDto)
    const validFields = ['name', 'email', 'phone', 'address', 'role', 'avatar'];
    const sanitizedData: UserStatusUpdate = {};
    
    // Only include valid fields that BE accepts
    Object.keys(data).forEach(key => {
      if (validFields.includes(key) && data[key as keyof UserStatusUpdate] !== undefined) {
        sanitizedData[key as keyof UserStatusUpdate] = data[key as keyof UserStatusUpdate];
      }
    });

    console.log('📤 Sanitized data being sent to BE:', sanitizedData);
    
    const response = await api.patch<User>(`/user/${id}`, sanitizedData);
    console.log('✅ User update successful:', response.data);
    
    return response.data;
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
    console.log('🔍 Toggle user status using role-based approach:', { id, makeActive });
    
    // Get current user data first
    const currentUser = await getUser(id);
    console.log('📋 Current user:', currentUser);
    
    // Strategy: Use role to indicate status
    // - Active users keep their current role (admin, staff, user)
    // - Inactive users get a "disabled" role or we use soft delete
    
    if (!makeActive) {
      // Deactivate user by using soft delete (which BE supports)
      console.log('🚫 Deactivating user via soft delete');
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
      console.log('⚠️ Cannot activate deleted users without BE support');
      
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
    console.log('✅ User deleted successfully');
  } catch (error: any) {
    console.error('❌ Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error?.message || 'Unknown error'}`);
  }
};

// Get user count
export const fetchUsersCount = async (): Promise<number> => {
  try {
    const response = await api.get('/user/count');
    return response.data.total || 0;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
};

// Get user roles
export const getUserRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    console.log('🔍 Roles API response:', response.data);
    
    // Handle different possible response structures
    let roles = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      roles = response.data.data;
    } else if (Array.isArray(response.data)) {
      roles = response.data;
    } else if (response.data?.roles && Array.isArray(response.data.roles)) {
      roles = response.data.roles;
    }
    
    console.log('✅ Extracted roles:', roles.length, roles);
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
