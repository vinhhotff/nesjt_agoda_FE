'use client';

import { useState, useEffect } from 'react';
import { Review, PaginatedReview } from '@/src/Types';
import { getReviewsByMenuItem } from '@/src/lib/api/reviewApi';
import ReviewCard from './ReviewCard';
import { LoadingSpinner } from '@/src/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewListProps {
  menuItemId: string;
  showMenuItem?: boolean;
}

export default function ReviewList({ menuItemId, showMenuItem = false }: ReviewListProps) {
  const [reviews, setReviews] = useState<PaginatedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchReviews = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await getReviewsByMenuItem(menuItemId, pageNum, limit);
      // Ensure data is in correct format with data array and pagination
      if (data && typeof data === 'object') {
        // Check if data has the expected structure
        if (data.data && Array.isArray(data.data) && data.pagination) {
          setReviews(data as PaginatedReview);
        } else {
          // Fallback: create empty paginated response
          console.warn('Unexpected review data format:', data);
          setReviews({
            data: [],
            pagination: {
              page: pageNum,
              limit,
              total: 0,
              totalPages: 0,
            },
          });
        }
      } else {
        setReviews(null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [menuItemId, page]);

  if (loading && !reviews) {
    return <LoadingSpinner size="md" text="Loading reviews..." />;
  }

  if (!reviews || !reviews.data || !Array.isArray(reviews.data) || reviews.data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {Array.isArray(reviews.data) && reviews.data.map((review) => (
          <ReviewCard key={review._id} review={review} showMenuItem={showMenuItem} />
        ))}
      </div>

      {/* Pagination */}
      {reviews.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-100">
          <p className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, reviews.pagination.total)} of {reviews.pagination.total} reviews
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {reviews.pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(reviews.pagination.totalPages, p + 1))}
              disabled={page === reviews.pagination.totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

