'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import RatingStars from './RatingStars';
import { createReview } from '@/src/lib/api/reviewApi';
import { useAuth } from '@/src/Context/AuthContext';

interface ReviewFormProps {
  menuItemId: string;
  menuItemName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  menuItemId,
  menuItemName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        menuItem: menuItemId,
        rating,
        comment: comment.trim() || undefined,
        guestName: !user ? 'Guest' : undefined,
      });

      toast.success('Review submitted successfully! It will be reviewed before being published.');
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-amber-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Write a Review for {menuItemName}
      </h3>

      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <RatingStars rating={rating} onRatingChange={setRating} />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none transition-all"
          placeholder="Share your experience with this dish..."
        />
        <p className="text-xs text-gray-500 mt-1">Your review will be reviewed before being published.</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-lg hover:from-amber-600 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

