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
import { UserProfile, Follow, BlockItem, MuteItem } from '../models/types';

const USERS_COLLECTION = 'users';
const FOLLOWS_COLLECTION = 'follows';
const BLOCKS_COLLECTION = 'blocks';
const MUTES_COLLECTION = 'mutes';

export const userService = {
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('username', '==', username.toLowerCase().trim()),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as UserProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, USERS_COLLECTION);
    }
  },

  async getUserByUid(uid: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
      if (!snap.exists()) return null;
      return snap.data() as UserProfile;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
    }
  },

  async isFollowingUser(followerUid: string, targetUid: string): Promise<boolean> {
    if (!followerUid || !targetUid) return false;
    try {
      const snap = await getDoc(doc(db, FOLLOWS_COLLECTION, `${followerUid}_${targetUid}`));
      return snap.exists();
    } catch {
      return false;
    }
  },

  async followUser(followerUid: string, targetUid: string): Promise<void> {
    const followId = `${followerUid}_${targetUid}`;
    try {
      const batch = writeBatch(db);

      const followData: Follow = {
        id: followId,
        followerUid,
        targetUid,
        createdAt: new Date().toISOString()
      };
      batch.set(doc(db, FOLLOWS_COLLECTION, followId), followData);

      // Increment target user's followersCount
      batch.update(doc(db, USERS_COLLECTION, targetUid), {
        followersCount: increment(1)
      });

      // Increment follower user's followingCount
      batch.update(doc(db, USERS_COLLECTION, followerUid), {
        followingCount: increment(1)
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${FOLLOWS_COLLECTION}/${followId}`);
    }
  },

  async unfollowUser(followerUid: string, targetUid: string): Promise<void> {
    const followId = `${followerUid}_${targetUid}`;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, FOLLOWS_COLLECTION, followId));

      batch.update(doc(db, USERS_COLLECTION, targetUid), {
        followersCount: increment(-1)
      });

      batch.update(doc(db, USERS_COLLECTION, followerUid), {
        followingCount: increment(-1)
      });

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${FOLLOWS_COLLECTION}/${followId}`);
    }
  },

  async getFollowingUids(userId: string): Promise<string[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, FOLLOWS_COLLECTION),
        where('followerUid', '==', userId),
        limit(100)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => (d.data() as Follow).targetUid);
    } catch {
      return [];
    }
  },

  async isUsernameTaken(username: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('username', '==', username.toLowerCase().trim()),
        limit(1)
      );
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, USERS_COLLECTION);
      return false;
    }
  },

  async blockUser(userId: string, blockedUid: string): Promise<void> {
    const blockId = `${userId}_${blockedUid}`;
    try {
      const data: BlockItem = {
        id: blockId,
        userId,
        blockedUid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, BLOCKS_COLLECTION, blockId), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${BLOCKS_COLLECTION}/${blockId}`);
    }
  },

  async unblockUser(userId: string, blockedUid: string): Promise<void> {
    const blockId = `${userId}_${blockedUid}`;
    try {
      await deleteDoc(doc(db, BLOCKS_COLLECTION, blockId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${BLOCKS_COLLECTION}/${blockId}`);
    }
  },

  async isUserBlocked(userId: string, blockedUid: string): Promise<boolean> {
    if (!userId || !blockedUid) return false;
    try {
      const snap = await getDoc(doc(db, BLOCKS_COLLECTION, `${userId}_${blockedUid}`));
      return snap.exists();
    } catch {
      return false;
    }
  },

  async muteUser(userId: string, mutedUid: string): Promise<void> {
    const muteId = `${userId}_${mutedUid}`;
    try {
      const data: MuteItem = {
        id: muteId,
        userId,
        mutedUid,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, MUTES_COLLECTION, muteId), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${MUTES_COLLECTION}/${muteId}`);
    }
  },

  async unmuteUser(userId: string, mutedUid: string): Promise<void> {
    const muteId = `${userId}_${mutedUid}`;
    try {
      await deleteDoc(doc(db, MUTES_COLLECTION, muteId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${MUTES_COLLECTION}/${muteId}`);
    }
  },

  async isUserMuted(userId: string, mutedUid: string): Promise<boolean> {
    if (!userId || !mutedUid) return false;
    try {
      const snap = await getDoc(doc(db, MUTES_COLLECTION, `${userId}_${mutedUid}`));
      return snap.exists();
    } catch {
      return false;
    }
  },

  async getFollowers(userId: string, limitCount = 50): Promise<UserProfile[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, FOLLOWS_COLLECTION),
        where('targetUid', '==', userId),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const followerUids = snap.docs.map(d => (d.data() as Follow).followerUid);
      const profiles: UserProfile[] = [];
      for (const fUid of followerUids) {
        const u = await userService.getUserByUid(fUid);
        if (u) profiles.push(u);
      }
      return profiles;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, FOLLOWS_COLLECTION);
      return [];
    }
  },

  async getFollowing(userId: string, limitCount = 50): Promise<UserProfile[]> {
    if (!userId) return [];
    try {
      const q = query(
        collection(db, FOLLOWS_COLLECTION),
        where('followerUid', '==', userId),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const targetUids = snap.docs.map(d => (d.data() as Follow).targetUid);
      const profiles: UserProfile[] = [];
      for (const tUid of targetUids) {
        const u = await userService.getUserByUid(tUid);
        if (u) profiles.push(u);
      }
      return profiles;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, FOLLOWS_COLLECTION);
      return [];
    }
  },

  async deleteAccountData(userId: string): Promise<void> {
    try {
      // 1. Delete private info
      await deleteDoc(doc(db, USERS_COLLECTION, userId, 'private', 'info'));
      // 2. Delete public profile
      await deleteDoc(doc(db, USERS_COLLECTION, userId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
    }
  }
};
