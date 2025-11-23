'use client';

import { INotification } from '@/src/Types';
import { Bell, Check, X, ShoppingCart, Calendar, Star, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getNotificationIcon = (type: INotification['type']) => {
  switch (type) {
    case 'order_new':
    case 'order_status_changed':
    case 'order_cancelled':
      return <ShoppingCart className="w-5 h-5" />;
    case 'reservation_new':
    case 'reservation_confirmed':
    case 'reservation_cancelled':
      return <Calendar className="w-5 h-5" />;
    case 'review_new':
    case 'review_approved':
      return <Star className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

const getNotificationColor = (type: INotification['type'], priority: INotification['priority']) => {
  if (priority === 'urgent') return 'bg-red-100 border-red-300 text-red-800';
  if (priority === 'high') return 'bg-amber-100 border-amber-300 text-amber-800';
  if (type === 'order_cancelled' || type === 'reservation_cancelled') return 'bg-gray-100 border-gray-300 text-gray-800';
  return 'bg-blue-100 border-blue-300 text-blue-800';
};

export default function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const isUnread = !notification.read;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className={`p-4 border-l-4 rounded-lg transition-all ${
        isUnread
          ? getNotificationColor(notification.type, notification.priority)
          : 'bg-white border-gray-200 text-gray-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${isUnread ? 'text-current' : 'text-gray-400'}`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${isUnread ? 'text-current' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${isUnread ? 'text-current/90' : 'text-gray-600'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">{timeAgo}</p>
            </div>
            {isUnread && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMarkAsRead(notification._id)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(notification._id)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          {notification.actionUrl && (
            <Link
              href={notification.actionUrl}
              className="inline-block mt-2 text-xs font-medium text-current underline hover:no-underline"
            >
              View details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

