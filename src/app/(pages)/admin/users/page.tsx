"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
import { UserPlus, Users } from 'lucide-react';

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
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Users Management"
          description="Manage system users and their permissions"
          icon={<Users className="w-6 h-6 text-white" />}
          action={
            <button
              onClick={() => { setSelectedUser(null); setShowFormModal(true); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              Add User
            </button>
          }
        />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
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
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <UserTable
            users={users}
            roles={roles}
            actionLoading={actionLoading}
            onEdit={(user) => { setSelectedUser(user); setShowFormModal(true); }}
            onResetPassword={handleResetPassword}
            onToggleStatus={handleDelete}
            onDelete={handleDelete}
          />
        </div>

        <div className="mt-6">
          <AdminPagination {...paginationProps} />
        </div>

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
