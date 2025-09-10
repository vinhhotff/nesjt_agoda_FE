'use client';

import React, { useState, useEffect } from 'react';
import { getUsersPaginate } from '@/src/lib/api/userApi';
import { User } from '@/src/Types';
import { testRoleMapping } from '@/src/lib/utils/roleUtils';

/**
 * Test component to verify role mapping works correctly
 * Remove this after confirming the fix works
 */
const RoleMappingTest: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Run role mapping tests
    testRoleMapping();
  }, []);

  const testUserFetch = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 Testing user fetch with role mapping...');
      const result = await getUsersPaginate({ page: 1, limit: 5 });
      
      console.log('📋 User fetch result:', result);
      setUsers(result.items);
      
      // Check if roles are properly mapped
      const roleIssues = result.items.filter(user => 
        !user.role || 
        user.role.length === 24 || // Likely ObjectId
        typeof user.role !== 'string'
      );
      
      if (roleIssues.length > 0) {
        setError(`Found ${roleIssues.length} users with unmapped roles`);
        console.warn('❌ Users with role mapping issues:', roleIssues);
      } else {
        console.log('✅ All user roles properly mapped!');
      }
      
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      console.error('❌ Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">🧪 Role Mapping Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        This component tests if user roles are properly mapped from ObjectId to role names.
        Check the console for detailed logs.
      </p>
      
      <button
        onClick={testUserFetch}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Testing...' : 'Test User Fetch'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {users.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Sample Users:</h4>
          <div className="bg-white rounded border overflow-hidden">
            {users.slice(0, 3).map((user) => (
              <div key={user._id} className="p-3 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{user.name || 'No Name'}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role && user.role.length < 24 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Role: {user.role || 'No Role'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleMappingTest;
