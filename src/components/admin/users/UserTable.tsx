import React from 'react';
import { User, Role } from '@/src/Types';
import { Edit, Trash2, UserCheck, UserX, Key, Phone, Shield } from 'lucide-react';
import AdminTable from '@/src/components/admin/common/AdminTable';
import { getRoleNameWithFallback } from '@/src/lib/api';

interface UserTableProps {
  users: User[];
  roles: Role[];
  actionLoading?: string | null;
  onEdit: (user: User) => void;
  onResetPassword: (userId: string) => void;
  onToggleStatus: (userId: string, makeActive: boolean) => void;
  onDelete: (userId: string) => void;
}

export default function UserTable({ users, roles, actionLoading, onEdit, onResetPassword, onToggleStatus, onDelete }: UserTableProps) {
  const headers = ['User', 'Role', 'Contact', 'Member', 'Created', 'Actions'];

  const emptyState = (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
      <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
    </div>
  );

  return (
    <AdminTable headers={headers} emptyState={users.length === 0 ? emptyState : undefined} className="rounded-2xl shadow-lg border border-gray-200">
      {users.map((user) => {
        const roleName = getRoleNameWithFallback(user.role as any, roles);
        // Derive inactive state - primarily using soft delete since BE doesn't support status fields
        const isInactive = (() => {
          const u: any = user;
          // Primary method: check if user is soft deleted
          if (typeof u.isDeleted === 'boolean') return u.isDeleted;
          
          // Fallback methods (in case BE changes in future)
          if (typeof u.isActive === 'boolean') return !u.isActive;
          if (typeof u.disabled === 'boolean') return u.disabled;
          if (typeof u.status === 'string') return u.status.toLowerCase() !== 'active';
          
          // Default to active if no status indicators found
          return false;
        })();
        return (
          <tr key={user._id} className={`hover:bg-gray-50 ${isInactive ? 'opacity-60 bg-red-50' : ''}`}>
            <td className="py-4 px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  {user.avatar ? (
                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-700 font-medium text-sm">{user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                    {isInactive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            </td>
            <td className="py-4 px-6">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                roleName === 'admin' ? 'bg-purple-100 text-purple-800' : roleName === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                {roleName.toUpperCase() || 'USER'}
              </span>
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
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isMember ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
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
                <button onClick={() => onEdit(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-200 rounded-lg shadow transition-colors" title="Edit User">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => onResetPassword(user._id)} disabled={actionLoading === user._id} className="p-2 text-green-600 bg-green-50 hover:bg-green-200 rounded-lg shadow transition-colors disabled:opacity-50" title="Reset Password">
                  <Key className="w-4 h-4" />
                </button>
                <button onClick={() => onToggleStatus(user._id, isInactive)} disabled={actionLoading === user._id} className={`p-2 rounded-lg shadow transition-colors disabled:opacity-50 ${isInactive ? 'text-green-600 bg-green-50 hover:bg-green-200' : 'text-orange-600 bg-orange-50 hover:bg-orange-200'}`} title={isInactive ? 'Activate User' : 'Deactivate User'}>
                  {isInactive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                </button>
                <button onClick={() => onDelete(user._id)} disabled={actionLoading === user._id} className="p-2 text-red-600 bg-red-50 hover:bg-red-200 rounded-lg shadow transition-colors disabled:opacity-50" title="Delete User">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </AdminTable>
  );
}

