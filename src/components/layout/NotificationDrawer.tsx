import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Bell,
  CheckCheck,
  MessageSquare,
  Award,
  ThumbsUp,
  UserCheck,
  Shield,
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { NotificationItem } from '../../core/models/types';
import { ReputationBadge } from '../user/ReputationBadge';
import { timeAgo } from '../../core/utils/timeAgo';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  onMarkAllRead: () => void;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkAllRead,
  onMarkRead,
  onDelete
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'accepted':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
        );
      case 'vote':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <ThumbsUp className="w-4 h-4" />
          </div>
        );
      case 'answer':
      case 'comment':
        return (
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'helpful':
        return (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'follow':
        return (
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      onMarkRead(item.notificationId);
    }
    onClose();
    if (item.targetId) {
      navigate(`/question/${item.targetId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-drawer-title"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="notification-drawer-title"
                    className="text-base font-bold text-neutral-950 dark:text-white font-display"
                  >
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-red-500 text-white rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500">Live community activity & reputation updates</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition-colors"
                aria-label="Close notifications drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
                <div className="animate-spin w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white rounded-full mx-auto" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  All caught up!
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  No notifications yet. You will be alerted when other members vote on, accept, or answer your questions.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notificationId}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer group ${
                    item.isRead
                      ? 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                      : 'bg-emerald-50/20 dark:bg-emerald-950/10 border-l-2 border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                  }`}
                >
                  {getNotificationIcon(item.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-semibold truncate ${
                          item.isRead
                            ? 'text-neutral-800 dark:text-neutral-200'
                            : 'text-neutral-950 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.reputationDelta ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          +{item.reputationDelta} rep
                        </span>
                      ) : null}

                      {item.senderUid && (
                        <ReputationBadge userId={item.senderUid} size="xs" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.notificationId);
                      }}
                      title="Delete notification"
                      className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <Link
              to="/notifications"
              onClick={onClose}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white font-medium inline-flex items-center gap-1"
            >
              <span>Full Notification Center</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <span className="text-[11px] text-neutral-400">
              {notifications.length} total
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};
