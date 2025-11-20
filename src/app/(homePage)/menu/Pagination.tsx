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
    <div className={`${className} space-y-6`}>
      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        {/* Previous button */}
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-yellow-500 hover:to-yellow-600 hover:text-white hover:shadow-lg"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1.5">
          {visiblePages.map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <div className="flex items-center justify-center w-10 h-10">
                  <MoreHorizontal size={18} className="text-gray-400" />
                </div>
              ) : (
                <button
                  onClick={() => setPage(pageNum as number)}
                  className={`min-w-[44px] h-11 px-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                    pageNum === page
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30 scale-110'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105'
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
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-yellow-500 hover:to-yellow-600 hover:text-white hover:shadow-lg"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Results summary */}
      <div className="text-center text-sm text-gray-600">
        Showing <span className="font-bold text-gray-900">{startItem}</span> to{' '}
        <span className="font-bold text-gray-900">{endItem}</span> of{' '}
        <span className="font-bold text-gray-900">{total}</span> dishes
      </div>
    </div>
  );
}
