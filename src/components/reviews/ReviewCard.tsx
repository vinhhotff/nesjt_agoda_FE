'use client';

import { Review } from '@/src/Types';
import RatingStars from './RatingStars';
import { User, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface ReviewCardProps {
  review: Review;
  showMenuItem?: boolean;
}

export default function ReviewCard({ review, showMenuItem = false }: ReviewCardProps) {
  const menuItem = typeof review.menuItem === 'object' ? review.menuItem : null;
  const user = typeof review.user === 'object' ? review.user : null;
  const displayName = user?.name || review.guestName || 'Anonymous';
  const displayAvatar = user?.avatar;

  return (
    <div className="bg-white rounded-lg border border-amber-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt={displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{displayName}</h4>
              {user && (
                <span className="text-xs text-gray-500">Verified Customer</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={review.rating} readonly size="sm" />
              <span className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
        {showMenuItem && menuItem && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{menuItem.name}</p>
          </div>
        )}
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {review.images.slice(0, 3).map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={`Review image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Reply */}
      {review.repliedBy && review.repliedBy.reply && (
        <div className="mt-3 pt-3 border-t border-amber-100">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Restaurant Response
              </p>
              <p className="text-sm text-gray-600">{review.repliedBy.reply}</p>
              {review.repliedBy.repliedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.repliedBy.repliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

