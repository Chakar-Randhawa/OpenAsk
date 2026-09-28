import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { Comment } from '../models/types';

const COMMENTS_COLLECTION = 'comments';

export const commentService = {
  async createComment(
    targetType: 'question' | 'answer',
    targetId: string,
    body: string,
    isAnonymous: boolean,
    authorUid: string,
    authorDisplayName: string,
    authorUsername: string
  ): Promise<Comment> {
    const commentId = 'cm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    const comment: Comment = {
      commentId,
      targetType,
      targetId,
      body: body.trim(),
      isAnonymous,
      authorUid: isAnonymous ? undefined : authorUid,
      authorDisplayName: isAnonymous ? 'Anonymous' : authorDisplayName,
      authorUsername: isAnonymous ? undefined : authorUsername,
      createdAt: now
    };

    try {
      await setDoc(doc(db, COMMENTS_COLLECTION, commentId), comment);
      return comment;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${COMMENTS_COLLECTION}/${commentId}`);
    }
  },

  async getCommentsForTarget(targetType: 'question' | 'answer', targetId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('targetType', '==', targetType),
        where('targetId', '==', targetId),
        limit(50)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data() as Comment);
      return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, COMMENTS_COLLECTION);
    }
  },

  async deleteComment(commentId: string, authorUid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COMMENTS_COLLECTION}/${commentId}`);
    }
  }
};
