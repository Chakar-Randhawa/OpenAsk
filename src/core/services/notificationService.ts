import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { NotificationItem } from '../models/types';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  async getNotifications(recipientUid: string): Promise<NotificationItem[]> {
    if (!recipientUid) return [];
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('recipientUid', '==', recipientUid),
        limit(50)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data() as NotificationItem);
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, NOTIFICATIONS_COLLECTION);
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
        isRead: true
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${NOTIFICATIONS_COLLECTION}/${notificationId}`);
    }
  },

  async markAllAsRead(notifications: NotificationItem[]): Promise<void> {
    try {
      for (const item of notifications.filter(n => !n.isRead)) {
        await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, item.notificationId), {
          isRead: true
        });
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  },

  async createNotification(
    recipientUid: string,
    type: 'answer' | 'comment' | 'helpful' | 'vote' | 'follow' | 'system',
    title: string,
    body: string,
    targetId?: string,
    targetType?: string,
    senderUid?: string,
    senderName?: string
  ): Promise<void> {
    if (senderUid && senderUid === recipientUid) return; // Do not notify self
    const notificationId = 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const item: NotificationItem = {
      notificationId,
      recipientUid,
      senderUid,
      senderName,
      type,
      title,
      body,
      targetId,
      targetType,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), item);
    } catch {
      // Non-blocking notification dispatch
    }
  }
};
