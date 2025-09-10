import { useState, useEffect } from 'react';

interface UseAdminPaginationProps {
  fetchFunction: (page: number, limit: number, search?: string, filter?: string, sortBy?: string, sortOrder?: 'asc' | 'desc') => Promise<any>;
  itemsPerPage?: number;
  dependencies?: any[];
}

export function useAdminPagination({
  fetchFunction,
  itemsPerPage = 10,
  dependencies = []
}: UseAdminPaginationProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchFunction(
        currentPage,
        itemsPerPage,
        search || undefined,
        filter || undefined,
        sortBy,
        sortOrder
      );
      
      setData(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchData();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Immediate effect for pagination, filters, and sorting
  useEffect(() => {
    fetchData();
  }, [currentPage, filter, sortBy, sortOrder, ...dependencies]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (sortValue: string) => {
    const [field, order] = sortValue.split('-');
    setSortBy(field);
    setSortOrder(order as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const refetch = () => {
    fetchData();
  };

  return {
    // Data
    data,
    loading,
    totalItems,
    totalPages,
    currentPage,
    
    // Filters
    search,
    filter,
    sortBy,
    sortOrder,
    
    // Actions
    handlePageChange,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    resetFilters,
    refetch,
    
    // Pagination props for component
    paginationProps: {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      onPageChange: handlePageChange
    }
  };
}
