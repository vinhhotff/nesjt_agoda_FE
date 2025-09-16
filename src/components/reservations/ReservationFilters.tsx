'use client';

import { useState } from 'react';
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

  // Get today's date for default
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="data-table-filters">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Tìm theo tên khách hàng hoặc số điện thoại..."
        value={localSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="form-input"
        style={{ minWidth: '300px' }}
      />

      {/* Status Filter */}
      <select
        value={selectedStatus || 'all'}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="form-select"
      >
        <option value="all">Tất cả trạng thái</option>
        {Object.values(ReservationStatus).map(status => (
          <option key={status} value={status}>
            {reservationsAPI.getStatusText(status)}
          </option>
        ))}
      </select>

      {/* Date Filter */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => handleDateChange(e.target.value)}
        className="form-input"
        max="2030-12-31"
      />

      {/* Quick Date Filters */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button
          className={`btn small ${selectedDate === today ? 'primary' : 'outline'}`}
          onClick={() => handleDateChange(today)}
        >
          Hôm nay
        </button>
        <button
          className={`btn small ${selectedDate === '' ? 'primary' : 'outline'}`}
          onClick={() => handleDateChange('')}
        >
          Tất cả
        </button>
      </div>

      {/* Clear Filters */}
      <button
        className="btn ghost small"
        onClick={clearFilters}
      >
        🗑️ Xóa bộ lọc
      </button>

      {/* Filter Summary */}
      {(selectedStatus || selectedDate || localSearch) && (
        <div style={{ 
          fontSize: 'var(--font-sm)', 
          color: 'var(--gray-600)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          flexWrap: 'wrap'
        }}>
          <span>Đang lọc:</span>
          {selectedStatus && (
            <span className={`status-badge ${selectedStatus.replace('_', '-')}`}>
              {reservationsAPI.getStatusText(selectedStatus)}
            </span>
          )}
          {selectedDate && (
            <span className="status-badge in-progress">
              📅 {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </span>
          )}
          {localSearch && (
            <span className="status-badge pending">
              🔍 "{localSearch}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
