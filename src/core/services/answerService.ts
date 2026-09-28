import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  updateDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { Answer, AnswerOwner, Vote, HelpfulVote } from '../models/types';

const ANSWERS_COLLECTION = 'answers';
const ANSWER_OWNERS_COLLECTION = 'answerOwners';
const QUESTIONS_COLLECTION = 'questions';
const VOTES_COLLECTION = 'votes';
const HELPFUL_COLLECTION = 'helpfulVotes';

export interface CreateAnswerInput {
  questionId: string;
  body: string;
  isAnonymous: boolean;
  authorUid: string;
  authorDisplayName: string;
  authorUsername: string;
  authorPhotoUrl?: string;
}

export const answerService = {
  async createAnswer(input: CreateAnswerInput): Promise<string> {
    const answerId = 'ans_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();

    try {
      const batch = writeBatch(db);

      const answerData: Answer = {
        answerId,
        questionId: input.questionId,
        body: input.body.trim(),
        isAnonymous: input.isAnonymous,
        // STRICT PRIVACY: Mask author credentials if anonymous
        authorUid: input.isAnonymous ? undefined : input.authorUid,
        authorDisplayName: input.isAnonymous ? 'Anonymous' : input.authorDisplayName,
        authorUsername: input.isAnonymous ? undefined : input.authorUsername,
        authorPhotoUrl: input.isAnonymous ? undefined : (input.authorPhotoUrl || ''),
        voteCount: 0,
        helpfulCount: 0,
        createdAt: now,
        updatedAt: now
      };

      const ansRef = doc(db, ANSWERS_COLLECTION, answerId);
      batch.set(ansRef, answerData);

      // Private ownership
      const ownerData: AnswerOwner = {
        answerId,
        questionId: input.questionId,
        ownerUid: input.authorUid,
        createdAt: now
      };
      const ownerRef = doc(db, ANSWER_OWNERS_COLLECTION, answerId);
      batch.set(ownerRef, ownerData);

      // Increment question answerCount
      const qRef = doc(db, QUESTIONS_COLLECTION, input.questionId);
      batch.update(qRef, { answerCount: increment(1), updatedAt: now });

      // If public, increment user answerCount
      if (!input.isAnonymous) {
        const userRef = doc(db, 'users', input.authorUid);
        batch.update(userRef, {
          answerCount: increment(1),
          updatedAt: now
        });
      }

      await batch.commit();
      return answerId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, ANSWERS_COLLECTION);
    }
  },

  async getAnswersForQuestion(questionId: string, sortBy: 'votes' | 'newest' = 'votes'): Promise<Answer[]> {
    try {
      const q = query(
        collection(db, ANSWERS_COLLECTION),
        where('questionId', '==', questionId),
        limit(100)
      );
      const snap = await getDocs(q);
      const answers = snap.docs.map(d => d.data() as Answer);

      if (sortBy === 'votes') {
        return answers.sort((a, b) => b.voteCount - a.voteCount);
      }
      return answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, ANSWERS_COLLECTION);
    }
  },

  async getUserVote(userId: string, answerId: string): Promise<1 | -1 | 0> {
    if (!userId) return 0;
    try {
      const voteRef = doc(db, VOTES_COLLECTION, `${userId}_${answerId}`);
      const snap = await getDoc(voteRef);
      if (snap.exists()) {
        const data = snap.data() as Vote;
        return data.value;
      }
      return 0;
    } catch {
      return 0;
    }
  },

  async voteAnswer(userId: string, answerId: string, questionId: string, value: 1 | -1): Promise<number> {
    const voteId = `${userId}_${answerId}`;
    const voteRef = doc(db, VOTES_COLLECTION, voteId);
    const ansRef = doc(db, ANSWERS_COLLECTION, answerId);

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
        const newVote: Vote = {
          id: voteId,
          userId,
          answerId,
          questionId,
          value,
          createdAt: new Date().toISOString()
        };
        await setDoc(voteRef, newVote);
      }

      await updateDoc(ansRef, {
        voteCount: increment(delta),
        updatedAt: new Date().toISOString()
      });

      return delta;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${VOTES_COLLECTION}/${voteId}`);
    }
  },

  async isHelpfulMarked(userId: string, answerId: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const helpfulRef = doc(db, HELPFUL_COLLECTION, `${userId}_${answerId}`);
      const snap = await getDoc(helpfulRef);
      return snap.exists();
    } catch {
      return false;
    }
  },

  async markHelpful(userId: string, answerId: string, questionId: string): Promise<boolean> {
    const helpfulId = `${userId}_${answerId}`;
    const helpfulRef = doc(db, HELPFUL_COLLECTION, helpfulId);
    const ansRef = doc(db, ANSWERS_COLLECTION, answerId);

    try {
      const snap = await getDoc(helpfulRef);
      if (snap.exists()) {
        // Remove helpful mark
        await deleteDoc(helpfulRef);
        await updateDoc(ansRef, {
          helpfulCount: increment(-1),
          updatedAt: new Date().toISOString()
        });
        return false;
      } else {
        // Mark helpful
        const record: HelpfulVote = {
          id: helpfulId,
          userId,
          answerId,
          questionId,
          createdAt: new Date().toISOString()
        };
        await setDoc(helpfulRef, record);
        await updateDoc(ansRef, {
          helpfulCount: increment(1),
          updatedAt: new Date().toISOString()
        });
        return true;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${HELPFUL_COLLECTION}/${helpfulId}`);
    }
  },

  async deleteAnswer(answerId: string, questionId: string, currentUid: string): Promise<void> {
    try {
      const ownerSnap = await getDoc(doc(db, ANSWER_OWNERS_COLLECTION, answerId));
      if (!ownerSnap.exists() || ownerSnap.data()?.ownerUid !== currentUid) {
        throw new Error('Unauthorized to delete this answer');
      }

      const batch = writeBatch(db);
      batch.delete(doc(db, ANSWERS_COLLECTION, answerId));
      batch.delete(doc(db, ANSWER_OWNERS_COLLECTION, answerId));
      batch.update(doc(db, QUESTIONS_COLLECTION, questionId), {
        answerCount: increment(-1),
        updatedAt: new Date().toISOString()
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${ANSWERS_COLLECTION}/${answerId}`);
    }
  },

  async editAnswer(answerId: string, newBody: string, currentUid: string): Promise<void> {
    try {
      const ownerSnap = await getDoc(doc(db, ANSWER_OWNERS_COLLECTION, answerId));
      if (!ownerSnap.exists() || ownerSnap.data()?.ownerUid !== currentUid) {
        throw new Error('Unauthorized to edit this answer');
      }
      const ansRef = doc(db, ANSWERS_COLLECTION, answerId);
      await updateDoc(ansRef, {
        body: newBody.trim(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${ANSWERS_COLLECTION}/${answerId}`);
    }
  },

  async getAnswersByAuthor(authorUid: string, limitCount = 50): Promise<Answer[]> {
    try {
      const q = query(
        collection(db, ANSWERS_COLLECTION),
        where('authorUid', '==', authorUid),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const answers = snap.docs.map(d => d.data() as Answer);
      return answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, ANSWERS_COLLECTION);
      return [];
    }
  }
};
