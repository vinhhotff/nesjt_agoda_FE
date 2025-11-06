interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = ""
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPages = Math.min(5, totalPages);
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 1));
    const endPage = Math.min(startPage + maxPages - 1, totalPages);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className={`bg-white border-t px-6 py-4 flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex space-x-1">
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={`page-${pageNum}-${index}`}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-2 border text-sm font-medium rounded-md ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
