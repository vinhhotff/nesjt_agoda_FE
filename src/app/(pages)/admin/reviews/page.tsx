'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Review, PaginatedReview } from '@/src/Types';
import {
  getAllReviews,
  updateReview,
  replyToReview,
  deleteReview,
} from '@/src/lib/api/reviewApi';
import { AdminLayout } from '@/src/components/layout';
import AdminPageHeader from '@/src/components/admin/common/AdminPageHeader';
import AdminPagination from '@/src/components/admin/common/AdminPagination';
import { LoadingSpinner } from '@/src/components/ui';
import { MessageSquare, Check, X, Trash2, Star } from 'lucide-react';
import RatingStars from '@/src/components/reviews/RatingStars';
import ReviewCard from '@/src/components/reviews/ReviewCard';

const ITEMS_PER_PAGE = 10;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<PaginatedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews(
        page,
        ITEMS_PER_PAGE,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (processingId) return; // Prevent multiple clicks
    setProcessingId(id);
    try {
      await updateReview(id, { status: 'approved' });
      toast.success('Review approved');
      await fetchReviews();
    } catch (error: any) {
      console.error('Approve error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to approve review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (processingId) return; // Prevent multiple clicks
    setProcessingId(id);
    try {
      await updateReview(id, { status: 'rejected' });
      toast.success('Review rejected');
      await fetchReviews();
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to reject review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingId) return; // Prevent multiple clicks
    if (!confirm('Are you sure you want to delete this review?')) return;
    setProcessingId(id);
    try {
      await deleteReview(id);
      toast.success('Review deleted');
      await fetchReviews();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete review');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    try {
      await replyToReview(selectedReview._id, replyText);
      toast.success('Reply sent');
      setShowReplyModal(false);
      setReplyText('');
      setSelectedReview(null);
      fetchReviews();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send reply');
    }
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="Review Management"
          description="Manage customer reviews and ratings"
          icon={<Star className="w-6 h-6 text-white" />}
        />

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" text="Loading reviews..." />
        ) : reviews && reviews.data.length > 0 ? (
          <>
            <div className="space-y-4">
              {reviews.data.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-lg border border-amber-100 p-4 shadow-sm relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <ReviewCard review={review} showMenuItem={true} />
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0 z-10 relative">
                      {review.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!processingId) handleApprove(review._id);
                            }}
                            disabled={processingId === review._id}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                          >
                            {processingId === review._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!processingId) handleReject(review._id);
                            }}
                            disabled={processingId === review._id}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                          >
                            {processingId === review._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                      {!review.repliedBy && review.status === 'approved' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedReview(review);
                            setShowReplyModal(true);
                          }}
                          className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors cursor-pointer"
                          title="Reply"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!processingId) handleDelete(review._id);
                        }}
                        disabled={processingId === review._id}
                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        {processingId === review._id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AdminPagination
              currentPage={page}
              totalPages={reviews.pagination.totalPages}
              totalItems={reviews.pagination.total}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No reviews found</p>
          </div>
        )}

        {/* Reply Modal */}
        {showReplyModal && selectedReview && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
              <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedReview(null);
                }}
              />
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-amber-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-5 border-b border-amber-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Reply to Review</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Respond to customer feedback</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowReplyModal(false);
                        setReplyText('');
                        setSelectedReview(null);
                      }}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Review Info */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {typeof selectedReview.user === 'object' && selectedReview.user?.name
                            ? selectedReview.user.name
                            : selectedReview.guestName || 'Guest'}
                        </span>
                        <RatingStars rating={selectedReview.rating} readonly size="sm" />
                      </div>
                      {selectedReview.comment && (
                        <p className="text-sm text-gray-700 italic">"{selectedReview.comment}"</p>
                      )}
                      {typeof selectedReview.menuItem === 'object' && selectedReview.menuItem && (
                        <p className="text-xs text-gray-500 mt-2">
                          Review for: <span className="font-medium">{selectedReview.menuItem.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                <div className="p-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Your Response
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none transition-all placeholder:text-gray-400"
                    placeholder="Write a professional and helpful response to this review..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Your reply will be visible to all customers viewing this review.
                  </p>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyModal(false);
                        setReplyText('');
                        setSelectedReview(null);
                      }}
                      className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-xl hover:from-amber-600 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

