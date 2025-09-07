"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Eye, 
  ChevronDown,
  Mail,
  Phone,
  Shield,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX,
  Key
} from 'lucide-react';

import { User, Role } from '@/src/Types';
import { 
  getUsersPaginate, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  resetUserPassword,
  getUserRoles,
  getRoleName,
  getRoleId,
  getRoleDisplay,
  getRoleNameWithFallback
} from '@/src/lib/api';

const ITEMS_PER_PAGE = 10;
const USER_ROLES = ['all', 'admin', 'staff', 'user'] as const;

interface UserFormModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  roles: Role[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, isOpen, onClose, onSave, roles }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    address: '',
    isMember: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Use getRoleNameWithFallback to handle ObjectId roles
      const userRoleName = getRoleNameWithFallback(user.role, roles).toLowerCase();
      console.log('User role from backend:', user.role);
      console.log('Extracted role name:', userRoleName);
      console.log('Available roles:', roles);
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password for existing users
        role: userRoleName,
        phone: user.phone || '',
        address: user.address || '',
        isMember: user.isMember || false,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        phone: '',
        address: '',
        isMember: false,
      });
    }
  }, [user, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    
    if (!user && !formData.password.trim()) {
      toast.error('Password is required for new users');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
              required
              disabled={!!user} // Disable email editing for existing users
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a role</option>
              {(Array.isArray(roles) ? roles : []).map((role) => (
                <option key={role._id} value={role.name.toLowerCase()}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter address"
              rows={2}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isMember"
              checked={formData.isMember}
              onChange={(e) => setFormData({ ...formData, isMember: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isMember" className="ml-2 block text-sm text-gray-700">
              Member
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsersPaginate(
        currentPage,
        ITEMS_PER_PAGE,
        search,
        roleFilter === 'all' ? undefined : roleFilter,
        sortBy,
        sortOrder
      );
      setUsers(response.items);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await getUserRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Default roles if API fails
      setRoles([
        { _id: '1', name: 'Admin', permissions: [], createdAt: '', updatedAt: '' },
        { _id: '2', name: 'Staff', permissions: [], createdAt: '', updatedAt: '' },
        { _id: '3', name: 'User', permissions: [], createdAt: '', updatedAt: '' },
      ]);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when searching
      } else {
        fetchUsers();
      }
    }, 500); // 500ms delay for search

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Immediate effect for pagination, filters, and sorting
  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = async (userData: Partial<User>) => {
    try {
      // Convert role name to ObjectId if needed
      const processedData = { ...userData };
      if (processedData.role && typeof processedData.role === 'string') {
        // Find the role ObjectId by name
        const roleObj = roles.find(r => r.name.toLowerCase() === processedData.role?.toLowerCase());
        if (roleObj) {
          processedData.role = roleObj._id;
        }
      }
      
      console.log('📝 Creating user with data:', processedData);
      await createUser(processedData);
      toast.success('User created successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      throw error;
    }
  };

  const handleUpdate = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      // Convert role name to ObjectId if needed
      const processedData = { ...userData };
      
      // Remove password field when updating (since it's not in the input and causes backend error)
      delete processedData.password;
      
      if (processedData.role && typeof processedData.role === 'string') {
        // Find the role ObjectId by name
        const roleObj = roles.find(r => r.name.toLowerCase() === processedData.role?.toLowerCase());
        if (roleObj) {
          processedData.role = roleObj._id;
        }
      }
      
      console.log('📝 Updating user with data:', processedData);
      await updateUser(selectedUser._id, processedData);
      toast.success('User updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      throw error;
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setActionLoading(userId);
      await deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      await toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return;
    
    try {
      setActionLoading(userId);
      await resetUserPassword(userId);
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // The useEffect with debounce will handle the actual search
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (sortValue: string) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order as 'asc' | 'desc');
    setCurrentPage(1); // Reset to first page when sorting
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Results Info */}
            <div className="w-full lg:hidden text-sm text-gray-600 mb-2">
              {search && (
                <span>Searching for "{search}"... </span>
              )}
              {roleFilter !== 'all' && (
                <span>Filter: {roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)} </span>
              )}
            </div>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </form>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              {/* Role Filter */}
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  {(Array.isArray(roles) ? roles : []).map((role) => (
                    <option key={role._id} value={role.name.toLowerCase()}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="role-asc">Role A-Z</option>
                  <option value="role-desc">Role Z-A</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset
              </button>

              {/* Refresh */}
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Role</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Member</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Created</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-700 font-medium text-sm">
                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        const roleName = getRoleNameWithFallback(user.role, roles);
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            roleName === 'admin' ? 'bg-purple-100 text-purple-800' :
                            roleName === 'staff' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <Shield className="w-3 h-3 mr-1" />
                            {roleName.toUpperCase() || 'USER'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        {user.phone && (
                          <div className="flex items-center text-gray-900 mb-1">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                        {user.address && (
                          <div className="text-gray-500 text-xs">
                            {user.address.length > 30 ? `${user.address.substring(0, 30)}...` : user.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isMember ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isMember ? 'Member' : 'Guest'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</div>
                        <div className="text-gray-500">{new Date(user.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowFormModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user._id)}
                          disabled={actionLoading === user._id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, !user.isDeleted)}
                          disabled={actionLoading === user._id}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            user.isDeleted 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-orange-600 hover:bg-orange-50'
                          }`}
                          title={user.isDeleted ? 'Activate User' : 'Deactivate User'}
                        >
                          {user.isDeleted ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={actionLoading === user._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {(() => {
                    // Generate unique page numbers
                    const pageNumbers = [];
                    const maxPages = Math.min(5, totalPages);
                    
                    // Calculate start page to center around current page
                    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                    const endPage = Math.min(startPage + maxPages - 1, totalPages);
                    
                    // Adjust start if we're near the end
                    if (endPage - startPage + 1 < maxPages) {
                      startPage = Math.max(1, endPage - maxPages + 1);
                    }
                    
                    // Generate the page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(i);
                    }
                    
                    return pageNumbers.map((pageNum, index) => (
                      <button
                        key={`page-${pageNum}-${index}`}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 border text-sm font-medium rounded-md ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ));
                  })()}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        user={selectedUser}
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedUser(null);
        }}
        onSave={selectedUser ? handleUpdate : handleCreate}
        roles={roles}
      />
    </div>
  );
};

export default UsersPage;
