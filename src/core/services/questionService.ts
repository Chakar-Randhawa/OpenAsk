import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { Question, QuestionOwner, SavedItem, QuestionFollow } from '../models/types';

const QUESTIONS_COLLECTION = 'questions';
const QUESTION_OWNERS_COLLECTION = 'questionOwners';
const QUESTION_FOLLOWS_COLLECTION = 'questionFollows';
const SAVED_ITEMS_COLLECTION = 'savedItems';

export interface CreateQuestionInput {
  title: string;
  body: string;
  categoryId: string;
  categoryName: string;
  tagIds: string[];
  isAnonymous: boolean;
  authorUid: string;
  authorDisplayName: string;
  authorUsername: string;
  authorPhotoUrl?: string;
}

export interface GetQuestionsOptions {
  categoryId?: string;
  tag?: string;
  authorUid?: string;
  feedType?: 'forYou' | 'trending' | 'new' | 'following';
  followedCategories?: string[];
  followedUsers?: string[];
  limitCount?: number;
}

export const questionService = {
  async createQuestion(input: CreateQuestionInput): Promise<string> {
    const questionId = 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();

    try {
      const batch = writeBatch(db);

      const questionData: Question = {
        questionId,
        title: input.title.trim(),
        body: input.body.trim(),
        categoryId: input.categoryId,
        categoryName: input.categoryName,
        tagIds: input.tagIds.map(t => t.trim().toLowerCase()),
        isAnonymous: input.isAnonymous,
        // STRICT PRIVACY: If anonymous, NEVER write the author's identity to the public question document
        authorUid: input.isAnonymous ? undefined : input.authorUid,
        authorDisplayName: input.isAnonymous ? 'Anonymous' : input.authorDisplayName,
        authorUsername: input.isAnonymous ? undefined : input.authorUsername,
        authorPhotoUrl: input.isAnonymous ? undefined : (input.authorPhotoUrl || ''),
        answerCount: 0,
        viewCount: 0,
        voteCount: 0,
        followerCount: 0,
        createdAt: now,
        updatedAt: now
      };

      const questionRef = doc(db, QUESTIONS_COLLECTION, questionId);
      batch.set(questionRef, questionData);

      // Private ownership tracking
      const ownerData: QuestionOwner = {
        questionId,
        ownerUid: input.authorUid,
        createdAt: now
      };
      const ownerRef = doc(db, QUESTION_OWNERS_COLLECTION, questionId);
      batch.set(ownerRef, ownerData);

      // Update user count if not anonymous
      if (!input.isAnonymous) {
        const userRef = doc(db, 'users', input.authorUid);
        batch.update(userRef, { questionCount: increment(1), updatedAt: now });
      }

      await batch.commit();
      return questionId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, QUESTIONS_COLLECTION);
    }
  },

  async getQuestions(opts: GetQuestionsOptions = {}): Promise<Question[]> {
    const count = opts.limitCount || 20;

    try {
      if (opts.categoryId) {
        const q = query(
          collection(db, QUESTIONS_COLLECTION),
          where('categoryId', '==', opts.categoryId),
          orderBy('createdAt', 'desc'),
          limit(count)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as Question);
      }

      if (opts.authorUid) {
        const q = query(
          collection(db, QUESTIONS_COLLECTION),
          where('authorUid', '==', opts.authorUid),
          orderBy('createdAt', 'desc'),
          limit(count)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data() as Question);
      }

      if (opts.feedType === 'following' && opts.followedUsers && opts.followedUsers.length > 0) {
        // Query questions by followed users (Firestore where 'in' allows up to 10 items)
        const targetUsers = opts.followedUsers.slice(0, 10);
        const q = query(
          collection(db, QUESTIONS_COLLECTION),
          where('authorUid', 'in', targetUsers),
          limit(count)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => d.data() as Question);
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Default chronological / discovery feed
      const q = query(
        collection(db, QUESTIONS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      const snap = await getDocs(q);
      const questions = snap.docs.map(d => d.data() as Question);

      if (opts.feedType === 'trending') {
        // Deterministic trending ranking: (views * 1) + (answers * 5) + (votes * 3) / freshness factor
        return [...questions].sort((a, b) => {
          const scoreA = (a.viewCount * 1) + (a.answerCount * 5) + (a.voteCount * 3);
          const scoreB = (b.viewCount * 1) + (b.answerCount * 5) + (b.voteCount * 3);
          return scoreB - scoreA;
        });
      }

      return questions;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, QUESTIONS_COLLECTION);
    }
  },

  async getQuestionById(questionId: string): Promise<Question | null> {
    try {
      const snap = await getDoc(doc(db, QUESTIONS_COLLECTION, questionId));
      if (!snap.exists()) return null;
      return snap.data() as Question;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${QUESTIONS_COLLECTION}/${questionId}`);
    }
  },

  async incrementViewCount(questionId: string): Promise<void> {
    try {
      const qRef = doc(db, QUESTIONS_COLLECTION, questionId);
      await updateDoc(qRef, { viewCount: increment(1) });
    } catch {
      // Non-blocking view increment
    }
  },

  async deleteQuestion(questionId: string, currentUid: string): Promise<void> {
    try {
      // Verify ownership
      const ownerSnap = await getDoc(doc(db, QUESTION_OWNERS_COLLECTION, questionId));
      if (!ownerSnap.exists() || ownerSnap.data()?.ownerUid !== currentUid) {
        throw new Error('Unauthorized to delete this question');
      }

      const batch = writeBatch(db);
      batch.delete(doc(db, QUESTIONS_COLLECTION, questionId));
      batch.delete(doc(db, QUESTION_OWNERS_COLLECTION, questionId));
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${QUESTIONS_COLLECTION}/${questionId}`);
    }
  },

  async editQuestion(questionId: string, title: string, body: string, currentUid: string): Promise<void> {
    try {
      const ownerSnap = await getDoc(doc(db, QUESTION_OWNERS_COLLECTION, questionId));
      if (!ownerSnap.exists() || ownerSnap.data()?.ownerUid !== currentUid) {
        throw new Error('Unauthorized to edit this question');
      }

      const qRef = doc(db, QUESTIONS_COLLECTION, questionId);
      await updateDoc(qRef, {
        title: title.trim(),
        body: body.trim(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${QUESTIONS_COLLECTION}/${questionId}`);
    }
  },

  async isFollowingQuestion(userId: string, questionId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const snap = await getDoc(doc(db, QUESTION_FOLLOWS_COLLECTION, `${userId}_${questionId}`));
      return snap.exists();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${QUESTION_FOLLOWS_COLLECTION}/${userId}_${questionId}`);
    }
  },

  async followQuestion(userId: string, questionId: string): Promise<void> {
    const id = `${userId}_${questionId}`;
    try {
      const followData: QuestionFollow = {
        id,
        userId,
        questionId,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, QUESTION_FOLLOWS_COLLECTION, id), followData);
      await updateDoc(doc(db, QUESTIONS_COLLECTION, questionId), {
        followerCount: increment(1)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${QUESTION_FOLLOWS_COLLECTION}/${id}`);
    }
  },

  async unfollowQuestion(userId: string, questionId: string): Promise<void> {
    const id = `${userId}_${questionId}`;
    try {
      await deleteDoc(doc(db, QUESTION_FOLLOWS_COLLECTION, id));
      await updateDoc(doc(db, QUESTIONS_COLLECTION, questionId), {
        followerCount: increment(-1)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${QUESTION_FOLLOWS_COLLECTION}/${id}`);
    }
  },

  async isSavedQuestion(userId: string, questionId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const snap = await getDoc(doc(db, SAVED_ITEMS_COLLECTION, `${userId}_${questionId}`));
      return snap.exists();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${SAVED_ITEMS_COLLECTION}/${userId}_${questionId}`);
    }
  },

  async saveQuestion(userId: string, question: Question): Promise<void> {
    const id = `${userId}_${question.questionId}`;
    try {
      const saveItem: SavedItem = {
        id,
        userId,
        itemType: 'question',
        itemId: question.questionId,
        questionId: question.questionId,
        title: question.title,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, SAVED_ITEMS_COLLECTION, id), saveItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${SAVED_ITEMS_COLLECTION}/${id}`);
    }
  },

  async unsaveQuestion(userId: string, questionId: string): Promise<void> {
    const id = `${userId}_${questionId}`;
    try {
      await deleteDoc(doc(db, SAVED_ITEMS_COLLECTION, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${SAVED_ITEMS_COLLECTION}/${id}`);
    }
  },

  async getSavedQuestions(userId: string): Promise<SavedItem[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, SAVED_ITEMS_COLLECTION),
        where('userId', '==', userId),
        where('itemType', '==', 'question'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as SavedItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, SAVED_ITEMS_COLLECTION);
    }
  }
};
