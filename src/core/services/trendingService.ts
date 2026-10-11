import { Question } from '../models/types';
import { questionService } from './questionService';

export interface TrendingTopic {
  id: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  summary: string;
  momentum: 'hot' | 'surging' | 'emerging' | 'active';
  momentumLabel: string;
  sampleKeywords: string[];
  questionCount: number;
}

export interface TrendingResponse {
  topics: TrendingTopic[];
  source: 'gemini' | 'algorithmic' | 'fallback';
  model?: string;
  count: number;
}

class TrendingService {
  private cache: { data: TrendingResponse; timestamp: number } | null = null;
  private readonly CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

  async getTrendingTopics(forceRefresh = false): Promise<TrendingResponse> {
    const now = Date.now();
    if (!forceRefresh && this.cache && now - this.cache.timestamp < this.CACHE_TTL_MS) {
      return this.cache.data;
    }

    try {
      // 1. Fetch recent questions from Firestore to provide context
      const questions = await questionService.getQuestions({
        feedType: 'trending',
        limitCount: 30,
      });

      // 2. Call server-side API endpoint
      const res = await fetch('/api/trending-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: TrendingResponse = await res.json();
      this.cache = { data, timestamp: now };
      return data;
    } catch (err) {
      console.warn('Failed to fetch trending topics from server, using local fallback:', err);
      // Client-side fallback if offline or request fails
      const fallback: TrendingResponse = {
        topics: [
          {
            id: 'aerobic-threshold',
            title: 'Physiological Markers & Training Thresholds',
            categorySlug: 'health-medicine',
            categoryName: 'Health & Medicine',
            summary: 'Discussions comparing lactate inflection, aerobic zones, and metabolic adaptations in endurance sport.',
            momentum: 'hot',
            momentumLabel: '🔥 Hot Topic',
            sampleKeywords: ['physiology', 'lactate', 'training'],
            questionCount: 3,
          },
          {
            id: 'distributed-consensus',
            title: 'Distributed State & Consensus Protocols',
            categorySlug: 'technology',
            categoryName: 'Technology',
            summary: 'Debates on Raft versus Paxos, quorum leases, and log replication under network partitioning.',
            momentum: 'surging',
            momentumLabel: '⚡ Surging',
            sampleKeywords: ['distributed-systems', 'consensus', 'raft'],
            questionCount: 2,
          },
          {
            id: 'quantum-computing',
            title: 'Qubit Coherence & Quantum Algorithms',
            categorySlug: 'physics',
            categoryName: 'Physics',
            summary: 'Inquiries comparing superconducting circuits and trapped ions for fault-tolerant error correction.',
            momentum: 'emerging',
            momentumLabel: '💡 Emerging',
            sampleKeywords: ['quantum', 'qubits', 'physics'],
            questionCount: 2,
          },
        ],
        source: 'fallback',
        count: 3,
      };
      return fallback;
    }
  }
}

export const trendingService = new TrendingService();
