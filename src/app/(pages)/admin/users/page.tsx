"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { UserPlus } from 'lucide-react';

import { User, Role } from '@/src/Types';
import { 
  getUsersPaginate, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  resetUserPassword,
  getUserRoles
} from '@/src/lib/api';
import { useAdminPagination } from '@/src/hooks/useAdminPagination';
import { AdminLayout } from '@/src/components/layout';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';
import AdminPagination from '@/src/components/admin/common/AdminPagination';
import UserFilters from '@/src/components/admin/users/UserFilters';
import UserTable from '@/src/components/admin/users/UserTable';
import UserFormModal from '@/src/components/admin/users/UserFormModal';

const ITEMS_PER_PAGE = 10;

const UsersPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination hook
  const {
    data: users,
    loading,
    search,
    filter: roleFilter,
    sortBy,
    sortOrder,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    resetFilters,
    refetch,
    paginationProps
  } = useAdminPagination({
    fetchFunction: (page, limit, search, filter, sortBy, sortOrder) => {
      return getUsersPaginate(
        page,
        limit,
        search,
        filter === 'all' ? undefined : filter,
        sortBy,
        sortOrder
      );
    },
    itemsPerPage: ITEMS_PER_PAGE
  });

  useEffect(() => {
    (async () => {
      try {
        const rolesData = await getUserRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([
          { _id: '1', name: 'Admin', permissions: [], createdAt: '', updatedAt: '' },
          { _id: '2', name: 'Staff', permissions: [], createdAt: '', updatedAt: '' },
          { _id: '3', name: 'User', permissions: [], createdAt: '', updatedAt: '' },
        ]);
      }
    })();
  }, []);

  const handleCreate = async (userData: Partial<User>) => {
    try {
      const processedData = { ...userData } as any;
      if (processedData.role && typeof processedData.role === 'string') {
        const roleObj = roles.find(r => r.name.toLowerCase() === processedData.role?.toLowerCase());
        if (roleObj) processedData.role = roleObj._id;
      }
      await createUser(processedData);
      toast.success('User created successfully');
      refetch();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
      throw error;
    }
  };

  const handleUpdate = async (userData: Partial<User>) => {
    if (!selectedUser) return;
    try {
      const processedData = { ...userData } as any;
      delete processedData.password;
      if (processedData.role && typeof processedData.role === 'string') {
        const roleObj = roles.find(r => r.name.toLowerCase() === processedData.role?.toLowerCase());
        if (roleObj) processedData.role = roleObj._id;
      }
      await updateUser(selectedUser._id, processedData);
      toast.success('User updated successfully');
      refetch();
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
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId: string, makeActive: boolean) => {
    try {
      setActionLoading(userId);
      
      // Show confirmation for deactivation (which uses soft delete)
      if (!makeActive) {
        const confirmMessage = 'Are you sure you want to deactivate this user? This will soft delete them and they will not be able to access the system.';
        if (!confirm(confirmMessage)) {
          setActionLoading(null);
          return;
        }
      }
      
      await toggleUserStatus(userId, makeActive);
      toast.success(`User ${makeActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      
      // Show specific error message for activation attempts
      if (error.message?.includes('User activation not supported')) {
        toast.error('Cannot reactivate deactivated users. Please contact system administrator.');
      } else {
        toast.error(error.message || 'Failed to update user status');
      }
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

  return (
    <AdminLayout>
      <div className="w-full max-w-6xl mx-auto mt-8 p-8 rounded-2xl shadow bg-white">
        <AdminPageHeader
          title="Users Management"
          description="Manage system users and their permissions"
          action={(
            <button
              onClick={() => { setSelectedUser(null); setShowFormModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          )}
        />

        <UserFilters
          search={search}
          roleFilter={roleFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          loading={loading}
          roles={roles}
          onSearchChange={handleSearchChange}
          onRoleFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onReset={resetFilters}
          onRefresh={refetch}
        />

        <UserTable
          users={users}
          roles={roles}
          actionLoading={actionLoading}
          onEdit={(user) => { setSelectedUser(user); setShowFormModal(true); }}
          onResetPassword={handleResetPassword}
          onToggleStatus={handleDelete}
          onDelete={handleDelete}
        />

        <AdminPagination {...paginationProps} />

        <UserFormModal
          user={selectedUser}
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setSelectedUser(null); }}
          onSave={selectedUser ? handleUpdate : handleCreate}
          roles={roles}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
