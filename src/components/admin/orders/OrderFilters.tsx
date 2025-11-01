import React from 'react';
import { Search, ChevronDown, RefreshCw, Download, Filter, X } from 'lucide-react';

interface OrderFiltersProps {
  search: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: string;
  loading: boolean;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  onExport: () => void;
  totalResults?: number;
}

export default function OrderFilters({
  search,
  statusFilter,
  sortBy,
  sortOrder,
  loading,
  onSearchChange,
  onStatusFilterChange,
  onSortChange,
  onReset,
  onRefresh,
  onExport,
  totalResults,
}: OrderFiltersProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (statusFilter && statusFilter !== 'all') count++;
    // Note: Date filters removed since they're not supported by the current API
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const orderStatuses = [
    { value: 'all', label: 'All Status', count: null },
    { value: 'pending', label: 'Pending', count: null },
    { value: 'preparing', label: 'Preparing', count: null },
    { value: 'served', label: 'Served', count: null },
    { value: 'cancelled', label: 'Cancelled', count: null },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Header with filter info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Order Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {totalResults !== undefined && (
          <span className="text-sm text-gray-500">
            {totalResults.toLocaleString()} orders found
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {/* First Row: Search and Main Filters */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer..."
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

          {/* Main Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Status Filter */}
            <div className="relative">
              <label className="sr-only">Filter by status</label>
              <select
                value={statusFilter || 'all'}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[130px]"
              >
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <label className="sr-only">Sort orders</label>
              
            </div>

            {/* Action Buttons */}
            <button
              onClick={onReset}
              disabled={activeFilterCount === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={activeFilterCount === 0 ? 'No filters to reset' : 'Reset all filters'}
            >
              Reset
            </button>

            <button
              onClick={onExport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              title="Export orders to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              title="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Note: Date filters removed - not supported by current pagination API */}
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
            {statusFilter && statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Status: {statusFilter}
                <button
                  onClick={() => onStatusFilterChange('all')}
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
