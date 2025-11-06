import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import styles from "./menu.module.css";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  setPage: (p: number) => void;
  className?: string;
}

export default function Pagination({ page, total, limit, setPage, className = "" }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    // Always include last page if totalPages > 1
    if (totalPages > 1) {
      range.push(totalPages);
    }

    let prev = 0;
    for (const pageNum of range) {
      if (pageNum - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (pageNum - prev !== 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(pageNum);
      prev = pageNum;
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`${className} space-y-4`}>
      {/* Results summary */}
      <div className="text-center text-sm text-gray-400">
        Showing <span className="font-medium text-yellow-400">{startItem}</span> to{' '}
        <span className="font-medium text-yellow-400">{endItem}</span> of{' '}
        <span className="font-medium text-yellow-400">{total}</span> results
      </div>

      {/* Pagination controls */}
      <div className={`${styles.pagination} ${className}`}>
        {/* Previous button */}
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-yellow-400"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <div className="flex items-center justify-center w-10 h-10">
                  <MoreHorizontal size={16} className="text-gray-500" />
                </div>
              ) : (
                <button
                  onClick={() => setPage(pageNum as number)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pageNum === page
                      ? 'bg-yellow-500 text-gray-900 ring-2 ring-yellow-400'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-yellow-400'
                  }`}
                >
                  {pageNum}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next button */}
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-yellow-400"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
