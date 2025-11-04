'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, CheckCircle } from 'lucide-react';
import { ReservationStatus, reservationsAPI } from '@/src/lib/api/reservationsApi';

interface ReservationFiltersProps {
  onFilterChange: (filters: {
    status?: ReservationStatus;
    date?: string;
    search?: string;
  }) => void;
  selectedStatus?: ReservationStatus;
  selectedDate: string;
  searchQuery: string;
}

export default function ReservationFilters({
  onFilterChange,
  selectedStatus,
  selectedDate,
  searchQuery
}: ReservationFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleStatusChange = (status: string) => {
    const statusValue = status === 'all' ? undefined : status as ReservationStatus;
    onFilterChange({
      status: statusValue,
      date: selectedDate,
      search: localSearch
    });
  };

  const handleDateChange = (date: string) => {
    onFilterChange({
      status: selectedStatus,
      date: date,
      search: localSearch
    });
  };

  const handleSearchChange = (search: string) => {
    setLocalSearch(search);
    onFilterChange({
      status: selectedStatus,
      date: selectedDate,
      search: search
    });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFilterChange({
      status: undefined,
      date: '',
      search: ''
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, số điện thoại..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <select
            value={selectedStatus || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.values(ReservationStatus).map(status => (
              <option key={status} value={status}>
                {reservationsAPI.getStatusText(status)}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            max="2030-12-31"
          />
        </div>

        {/* Clear Button */}
        {(selectedStatus || selectedDate || localSearch) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Nhanh:</span>
        <button
          onClick={() => handleDateChange(today)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            selectedDate === today
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Hôm nay
        </button>
        <button
          onClick={() => handleDateChange(tomorrow)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            selectedDate === tomorrow
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Ngày mai
        </button>
        <button
          onClick={() => handleDateChange('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !selectedDate
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Tất cả
        </button>
      </div>

      {/* Active Filters Display */}
      {(selectedStatus || selectedDate || localSearch) && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <span className="text-xs text-gray-500 font-medium">Đang lọc:</span>
          {selectedStatus && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {reservationsAPI.getStatusText(selectedStatus)}
            </span>
          )}
          {selectedDate && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </span>
          )}
          {localSearch && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              🔍 "{localSearch}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
