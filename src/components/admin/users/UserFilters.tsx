import React from 'react';
import { Search, ChevronDown, RefreshCw, Filter, X } from 'lucide-react';
import { Role } from '@/src/Types';

interface UserFiltersProps {
  search: string;
  roleFilter: string;
  sortBy: string;
  sortOrder: string;
  loading: boolean;
  roles: Role[];
  onSearchChange: (search: string) => void;
  onRoleFilterChange: (role: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  totalResults?: number;
}

export default function UserFilters({
  search,
  roleFilter,
  sortBy,
  sortOrder,
  loading,
  roles,
  onSearchChange,
  onRoleFilterChange,
  onSortChange,
  onReset,
  onRefresh,
  totalResults,
}: UserFiltersProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (roleFilter && roleFilter !== 'all') count++;
    // Note: status filter removed since BE doesn't support it yet
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Header with filter info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">User Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {totalResults !== undefined && (
          <span className="text-sm text-gray-500">
            {totalResults.toLocaleString()} users found
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Role Filter */}
          <div className="relative">
            <label className="sr-only">Filter by role</label>
            <select
              value={roleFilter || 'all'}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
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

          {/* Status Filter - Removed since BE doesn't support it */}

          {/* Sort */}
          <div className="relative">
            <label className="sr-only">Sort users</label>
            <select
              value={`${sortBy || 'createdAt'}-${sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortByValue, sortOrderValue] = e.target.value.split('-');
                onSortChange(sortByValue, sortOrderValue);
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Reset */}
          <button
            onClick={onReset}
            disabled={activeFilterCount === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={activeFilterCount === 0 ? 'No filters to reset' : 'Reset all filters'}
          >
            Reset
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            title="Refresh user data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Search: "{search}"
                <button
                  onClick={() => onSearchChange('')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {roleFilter && roleFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Role: {roleFilter}
                <button
                  onClick={() => onRoleFilterChange('all')}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

