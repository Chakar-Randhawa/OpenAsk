import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Question, Category, UserProfile } from '../models/types';
import { categoryService } from './categoryService';

export interface SearchResults {
  questions: Question[];
  categories: Category[];
  users: UserProfile[];
}

export interface SearchRepository {
  search(keyword: string): Promise<SearchResults>;
}

class FirestoreSearchRepository implements SearchRepository {
  async search(rawQuery: string): Promise<SearchResults> {
    const term = rawQuery.trim().toLowerCase();
    if (!term) {
      return { questions: [], categories: [], users: [] };
    }

    try {
      // 1. Search Categories
      const allCategories = await categoryService.getAllCategories();
      const matchedCategories = allCategories.filter(
        c => c.name.toLowerCase().includes(term) ||
             c.slug.toLowerCase().includes(term) ||
             c.description.toLowerCase().includes(term)
      ).slice(0, 8);

      // 2. Search Questions
      const questionsSnap = await getDocs(query(collection(db, 'questions'), limit(100)));
      const questions = questionsSnap.docs.map(d => d.data() as Question);
      const matchedQuestions = questions.filter(
        q => q.title.toLowerCase().includes(term) ||
             q.body.toLowerCase().includes(term) ||
             q.categoryName.toLowerCase().includes(term) ||
             q.tagIds.some(t => t.toLowerCase().includes(term))
      ).slice(0, 20);

      // 3. Search Users
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(50)));
      const users = usersSnap.docs.map(d => d.data() as UserProfile);
      const matchedUsers = users.filter(
        u => u.displayName.toLowerCase().includes(term) ||
             u.username.toLowerCase().includes(term) ||
             (u.bio && u.bio.toLowerCase().includes(term))
      ).slice(0, 10);

      return {
        questions: matchedQuestions,
        categories: matchedCategories,
        users: matchedUsers
      };
    } catch (err) {
      console.error('Search error:', err);
      return { questions: [], categories: [], users: [] };
    }
  }
}

export const searchService: SearchRepository = new FirestoreSearchRepository();
