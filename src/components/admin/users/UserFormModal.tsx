import React, { useEffect, useState } from 'react';
import { User, Role } from '@/src/Types';
import { getRoleNameWithFallback } from '@/src/lib/api';

interface UserFormModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => Promise<void> | void;
  roles: Role[];
}

export default function UserFormModal({ user, isOpen, onClose, onSave, roles }: UserFormModalProps) {
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
      const userRoleName = getRoleNameWithFallback(user.role as any, roles).toLowerCase();
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
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
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (!user && !formData.password.trim()) return;

    setLoading(true);
    try {
      await onSave(formData as any);
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
              required
              disabled={!!user}
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a role</option>
              {(Array.isArray(roles) ? roles : []).map((role) => (
                <option key={role._id} value={role.name.toLowerCase()}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
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
            <label htmlFor="isMember" className="ml-2 block text-sm text-gray-700">Member</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

