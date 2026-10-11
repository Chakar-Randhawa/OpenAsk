import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { Question, Category, UserProfile } from '../models/types';
import { categoryService } from './categoryService';

export interface SearchResults {
  questions: Question[];
  categories: Category[];
  users: UserProfile[];
  isUsernameQuery?: boolean;
}

export interface SearchRepository {
  search(keyword: string): Promise<SearchResults>;
  searchUsers(keyword: string): Promise<UserProfile[]>;
}

class FirestoreSearchRepository implements SearchRepository {
  async searchUsers(rawQuery: string): Promise<UserProfile[]> {
    const raw = rawQuery.trim().toLowerCase();
    if (!raw) return [];

    // Strip leading @ if present (e.g. "@alex" -> "alex")
    const cleanUsername = raw.replace(/^@+/, '');
    const userMap = new Map<string, UserProfile>();

    try {
      // 1. Direct exact username lookup
      if (cleanUsername) {
        const exactQ = query(
          collection(db, 'users'),
          where('username', '==', cleanUsername),
          limit(1)
        );
        const exactSnap = await getDocs(exactQ);
        for (const doc of exactSnap.docs) {
          const u = doc.data() as UserProfile;
          userMap.set(u.uid, u);
        }
      }

      // 2. Fetch recent community members for fuzzy & prefix matching
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(100)));
      const communityUsers = usersSnap.docs.map(d => d.data() as UserProfile);

      // Score and rank matched users
      const ranked: { user: UserProfile; score: number }[] = [];

      for (const u of communityUsers) {
        const uName = (u.username || '').toLowerCase();
        const dName = (u.displayName || '').toLowerCase();
        const bio = (u.bio || '').toLowerCase();

        let score = 0;

        if (cleanUsername && uName === cleanUsername) {
          score = 100; // Exact username match
        } else if (cleanUsername && uName.startsWith(cleanUsername)) {
          score = 80; // Prefix username match
        } else if (cleanUsername && uName.includes(cleanUsername)) {
          score = 60; // Substring username match
        } else if (dName.startsWith(raw)) {
          score = 50; // Display name prefix
        } else if (dName.includes(raw)) {
          score = 30; // Display name contains
        } else if (bio.includes(raw)) {
          score = 10; // Bio contains
        }

        if (score > 0) {
          ranked.push({ user: u, score });
        }
      }

      // Sort by score descending, then by reputation descending
      ranked.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.user.reputation || 0) - (a.user.reputation || 0);
      });

      for (const r of ranked) {
        if (!userMap.has(r.user.uid)) {
          userMap.set(r.user.uid, r.user);
        }
      }

      return Array.from(userMap.values()).slice(0, 20);
    } catch (err) {
      console.error('Error in searchUsers:', err);
      return [];
    }
  }

  async search(rawQuery: string): Promise<SearchResults> {
    const raw = rawQuery.trim();
    const term = raw.toLowerCase();
    if (!term) {
      return { questions: [], categories: [], users: [] };
    }

    const isUsernameQuery = raw.startsWith('@');
    const cleanUsername = term.replace(/^@+/, '');

    try {
      // 1. Search Users
      const matchedUsers = await this.searchUsers(raw);

      // 2. Search Categories (if not an explicit @username query)
      let matchedCategories: Category[] = [];
      if (!isUsernameQuery) {
        const allCategories = await categoryService.getAllCategories();
        matchedCategories = allCategories.filter(
          c => c.name.toLowerCase().includes(term) ||
               c.slug.toLowerCase().includes(term) ||
               c.description.toLowerCase().includes(term)
        ).slice(0, 8);
      }

      // 3. Search Questions
      const questionsSnap = await getDocs(query(collection(db, 'questions'), limit(100)));
      const questions = questionsSnap.docs.map(d => d.data() as Question);
      const matchedQuestions = questions.filter(
        q => {
          if (isUsernameQuery) {
            return q.authorUsername && q.authorUsername.toLowerCase() === cleanUsername;
          }
          return q.title.toLowerCase().includes(term) ||
                 q.body.toLowerCase().includes(term) ||
                 q.categoryName.toLowerCase().includes(term) ||
                 q.tagIds.some(t => t.toLowerCase().includes(term)) ||
                 (q.authorUsername && q.authorUsername.toLowerCase().includes(cleanUsername));
        }
      ).slice(0, 20);

      return {
        questions: matchedQuestions,
        categories: matchedCategories,
        users: matchedUsers,
        isUsernameQuery
      };
    } catch (err) {
      console.error('Search error:', err);
      return { questions: [], categories: [], users: [] };
    }
  }
}

export const searchService: SearchRepository = new FirestoreSearchRepository();
