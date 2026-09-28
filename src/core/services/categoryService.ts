import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase/firebase';
import { Category, CategoryFollow } from '../models/types';
import { INITIAL_CATEGORIES } from '../constants/initialCategories';

const CATEGORIES_COLLECTION = 'categories';
const CATEGORY_FOLLOWS_COLLECTION = 'categoryFollows';

export const categoryService = {
  getFallbackCategories(): Category[] {
    const now = new Date().toISOString();
    return INITIAL_CATEGORIES.map(cat => ({
      id: cat.slug,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      followerCount: 0,
      questionCount: 0,
      isActive: true,
      createdAt: now
    }));
  },

  async getAllCategories(): Promise<Category[]> {
    try {
      const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
      if (snap.empty) {
        // Return structured safe catalog directly without attempting unauthorized client writes
        return this.getFallbackCategories();
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    } catch (err) {
      console.warn('Unable to load categories from Firestore, falling back to seed categories:', err);
      return this.getFallbackCategories();
    }
  },

  async bootstrapCategories(): Promise<void> {
    // Trusted admin-only bootstrap operation
    if (auth.currentUser?.email !== 'aplphapower@gmail.com') {
      return;
    }
    try {
      const batch = writeBatch(db);
      const now = new Date().toISOString();
      for (const cat of INITIAL_CATEGORIES) {
        const catRef = doc(db, CATEGORIES_COLLECTION, cat.slug);
        batch.set(catRef, {
          id: cat.slug,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          followerCount: 0,
          questionCount: 0,
          isActive: true,
          createdAt: now
        });
      }
      await batch.commit();
    } catch (err) {
      console.warn('Admin categories bootstrap skipped or interrupted:', err);
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const snap = await getDoc(doc(db, CATEGORIES_COLLECTION, slug));
      if (!snap.exists()) {
        // Fallback check by slug field if doc id differs
        const q = query(collection(db, CATEGORIES_COLLECTION), where('slug', '==', slug));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const first = qSnap.docs[0];
          return { id: first.id, ...first.data() } as Category;
        }
        const fallback = INITIAL_CATEGORIES.find(c => c.slug === slug);
        if (fallback) {
          return {
            id: fallback.slug,
            name: fallback.name,
            slug: fallback.slug,
            description: fallback.description,
            icon: fallback.icon,
            followerCount: 0,
            questionCount: 0,
            isActive: true,
            createdAt: new Date().toISOString()
          };
        }
        return null;
      }
      return { id: snap.id, ...snap.data() } as Category;
    } catch (err) {
      console.warn(`Error getting category ${slug} from Firestore:`, err);
      const fallback = INITIAL_CATEGORIES.find(c => c.slug === slug);
      if (fallback) {
        return {
          id: fallback.slug,
          name: fallback.name,
          slug: fallback.slug,
          description: fallback.description,
          icon: fallback.icon,
          followerCount: 0,
          questionCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        };
      }
      return null;
    }
  },

  async isFollowingCategory(userId: string, categorySlug: string): Promise<boolean> {
    if (!userId || !categorySlug) return false;
    try {
      const followId = `${userId}_${categorySlug}`;
      const snap = await getDoc(doc(db, CATEGORY_FOLLOWS_COLLECTION, followId));
      return snap.exists();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${CATEGORY_FOLLOWS_COLLECTION}/${userId}_${categorySlug}`);
    }
  },

  async followCategory(userId: string, categorySlug: string): Promise<void> {
    const followId = `${userId}_${categorySlug}`;
    try {
      const followData: CategoryFollow = {
        id: followId,
        userId,
        categorySlug,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, CATEGORY_FOLLOWS_COLLECTION, followId), followData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `${CATEGORY_FOLLOWS_COLLECTION}/${followId}`);
    }
  },

  async unfollowCategory(userId: string, categorySlug: string): Promise<void> {
    const followId = `${userId}_${categorySlug}`;
    try {
      await deleteDoc(doc(db, CATEGORY_FOLLOWS_COLLECTION, followId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${CATEGORY_FOLLOWS_COLLECTION}/${followId}`);
    }
  }
};
