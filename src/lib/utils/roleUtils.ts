import { Role } from '@/src/Types';

// Utility functions for role handling - moved from main api file
export const getRoleName = (role: string | Role | any): string => {
  if (!role) return 'User';

  // If role is already a string
  if (typeof role === 'string') {
    // Check if it looks like an ObjectId (24 chars, hex)
    if (role.length === 24 && /^[0-9a-fA-F]{24}$/.test(role)) {
      console.warn('Role is ObjectId, cannot extract role name:', role);
      return 'User';
    }
    // It's likely a role name string
    return role;
  }

  // If role is a Role object
  if (typeof role === 'object' && role?.name) {
    return role.name;
  }

  return 'User';
};

export const getRoleId = (role: string | Role): string => {
  if (!role) return '';

  if (typeof role === 'string') {
    return role;
  }
  return role?._id || '';
};

export const getRoleDisplay = (role: string | Role): string => {
  const roleName = getRoleName(role);
  return roleName.charAt(0).toUpperCase() + roleName.slice(1);
};

// Enhanced getRoleName that can use roles list for ObjectId lookup
export const getRoleNameWithFallback = (
  role: string | Role,
  roles: Role[]
): string => {
  if (!role) return 'User';

  if (typeof role === 'string') {
    // Check if it looks like an ObjectId
    if (role.length === 24 && /^[0-9a-fA-F]{24}$/.test(role)) {
      // Try to find the role in the roles list
      if (Array.isArray(roles) && roles.length > 0) {
        const foundRole = roles.find(r => r._id === role);
        if (foundRole) {
          return foundRole.name;
        }
      }
      // Fallback to 'User' if role not found
      return 'User';
    }
    // It's likely a role name string
    return role;
  }

  // It's a Role object
  return role?.name || 'User';
};

// Helper function to find role by ID from roles list
export const findRoleById = (
  roleId: string,
  roles: Role[]
): Role | undefined => {
  if (!Array.isArray(roles)) {
    return undefined;
  }
  return roles.find((role) => role._id === roleId);
};

// Test function to validate role mapping
export const testRoleMapping = () => {
  const testCases = [
    { input: 'Admin', expected: 'Admin' },
    { input: 'user', expected: 'user' },
    { input: { _id: '123', name: 'Manager', permissions: [], createdAt: '', updatedAt: '' }, expected: 'Manager' },
    { input: '507f1f77bcf86cd799439011', expected: 'User' }, // ObjectId fallback
    { input: null, expected: 'User' },
    { input: undefined, expected: 'User' },
  ];

  console.log('🧪 Testing role mapping...');
  testCases.forEach((testCase, index) => {
    const result = getRoleName(testCase.input);
    const passed = result === testCase.expected;
    console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'} Input: ${JSON.stringify(testCase.input)} → Expected: ${testCase.expected}, Got: ${result}`);
  });
};
