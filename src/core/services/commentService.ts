import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { Comment, CommentVote } from '../models/types';

const COMMENTS_COLLECTION = 'comments';
const COMMENT_VOTES_COLLECTION = 'commentVotes';

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
      voteCount: 0,
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
      const list = snap.docs.map(d => {
        const data = d.data() as Comment;
        return {
          ...data,
          voteCount: data.voteCount || 0
        };
      });
      // Sort with high quality comments first, fallback to time
      return list.sort((a, b) => {
        const vDiff = (b.voteCount || 0) - (a.voteCount || 0);
        if (vDiff !== 0) return vDiff;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, COMMENTS_COLLECTION);
    }
  },

  async getUserVote(userId: string, commentId: string): Promise<1 | -1 | 0> {
    if (!userId || !commentId) return 0;
    try {
      const voteRef = doc(db, COMMENT_VOTES_COLLECTION, `${userId}_${commentId}`);
      const snap = await getDoc(voteRef);
      if (snap.exists()) {
        const data = snap.data() as { value: 1 | -1 };
        return data.value;
      }
      return 0;
    } catch {
      return 0;
    }
  },

  async voteComment(userId: string, commentId: string, targetId: string, value: 1 | -1): Promise<number> {
    const voteId = `${userId}_${commentId}`;
    const voteRef = doc(db, COMMENT_VOTES_COLLECTION, voteId);
    const cmRef = doc(db, COMMENTS_COLLECTION, commentId);

    try {
      const existingVoteSnap = await getDoc(voteRef);
      let delta: number = value;

      if (existingVoteSnap.exists()) {
        const prevValue = existingVoteSnap.data().value as number;
        if (prevValue === value) {
          // Cancel vote
          await deleteDoc(voteRef);
          delta = -value;
        } else {
          // Flip vote (-1 to 1 or 1 to -1)
          delta = value * 2;
          await updateDoc(voteRef, { value, createdAt: new Date().toISOString() });
        }
      } else {
        // Cast new vote
        const newVote: CommentVote = {
          id: voteId,
          userId,
          commentId,
          targetId,
          value,
          createdAt: new Date().toISOString()
        };
        await setDoc(voteRef, newVote);
      }

      await updateDoc(cmRef, {
        voteCount: increment(delta)
      });

      return delta;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COMMENTS_COLLECTION}/${commentId}`);
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
