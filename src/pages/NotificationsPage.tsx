import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, Award, ThumbsUp, UserCheck, Shield, Trash2 } from 'lucide-react';
import { NotificationItem } from '../core/models/types';
import { notificationService } from '../core/services/notificationService';
import { useAuth } from '../core/context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    notificationService.getNotifications(currentUser.uid).then((list) => {
      setNotifications(list);
      setLoading(false);
    });
  }, [currentUser]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications(prev =>
        prev.map(n => (n.notificationId === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notifId);
      setNotifications(prev => prev.filter(n => n.notificationId !== notifId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      await notificationService.markAllAsRead(notifications);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'helpful':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'vote':
        return <ThumbsUp className="w-4 h-4 text-amber-500" />;
      case 'follow':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Shield className="w-4 h-4 text-neutral-500" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-center space-y-3">
        <Bell className="w-8 h-8 text-neutral-400 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-950 dark:text-white font-display">Notifications</h2>
        <p className="text-xs text-neutral-500">Sign in to check updates and responses to your questions.</p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const displayed = filterUnread ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950 dark:text-white font-display">
            Notification Center
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real activity updates on your questions, answers, and interactions.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            !filterUnread
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            filterUnread
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2">
          <Bell className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            You're all caught up.
          </h3>
          <p className="text-xs text-neutral-500">
            {filterUnread ? 'No unread notifications at this time.' : 'Activity on your questions and answers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((item) => (
            <div
              key={item.notificationId}
              onClick={() => !item.isRead && handleMarkAsRead(item.notificationId)}
              className={`p-4 rounded-xl border transition-colors flex items-start gap-3.5 ${
                item.isRead
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white shadow-xs'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {getNotificationIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-950 dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                  {item.body}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-2">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  {item.targetId && (
                    <Link
                      to={`/question/${item.targetId}`}
                      className="text-neutral-700 dark:text-neutral-300 hover:underline font-medium"
                    >
                      View discussion
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-neutral-950 dark:bg-white" />
                )}
                <button
                  type="button"
                  onClick={(e) => handleDeleteNotification(e, item.notificationId)}
                  title="Delete notification"
                  className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors opacity-80 hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
