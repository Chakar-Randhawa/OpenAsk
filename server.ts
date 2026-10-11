import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface TrendingTopicItem {
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

// Algorithmic fallback if Gemini key is missing or fails
function generateFallbackTrending(questions: any[]): TrendingTopicItem[] {
  if (!questions || questions.length === 0) {
    return [
      {
        id: 'aerobic-threshold',
        title: 'Physiological Markers & Training Thresholds',
        categorySlug: 'health-medicine',
        categoryName: 'Health & Medicine',
        summary: 'Community discussions exploring lactate inflection, aerobic zones, and metabolic adaptations in endurance.',
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
        summary: 'Inquiries comparing superconducting circuits and trapped ions for fault-tolerant quantum error correction.',
        momentum: 'emerging',
        momentumLabel: '💡 Emerging',
        sampleKeywords: ['quantum', 'qubits', 'physics'],
        questionCount: 2,
      },
    ];
  }

  // Group by category
  const catMap = new Map<string, { name: string; questions: any[]; tags: Set<string> }>();
  for (const q of questions) {
    const slug = q.categoryId || 'general';
    const name = q.categoryName || 'General';
    if (!catMap.has(slug)) {
      catMap.set(slug, { name, questions: [], tags: new Set() });
    }
    const entry = catMap.get(slug)!;
    entry.questions.push(q);
    if (Array.isArray(q.tagIds)) {
      q.tagIds.forEach((t: string) => entry.tags.add(t));
    }
  }

  const sortedCats = Array.from(catMap.entries()).sort(
    (a, b) => b[1].questions.length - a[1].questions.length
  );

  const results: TrendingTopicItem[] = [];
  const momentumTypes: ('hot' | 'surging' | 'emerging' | 'active')[] = ['hot', 'surging', 'emerging', 'active'];
  const momentumLabels = ['🔥 Hot Topic', '⚡ Surging', '💡 Emerging', '💬 Active Discussion'];

  sortedCats.slice(0, 4).forEach(([catSlug, data], idx) => {
    const qCount = data.questions.length;
    const topQuestion = data.questions[0];
    const tags = Array.from(data.tags).slice(0, 3);

    results.push({
      id: `topic-${catSlug}-${idx}`,
      title: topQuestion ? topQuestion.title : `${data.name} Trends`,
      categorySlug: catSlug,
      categoryName: data.name,
      summary: `Active knowledge exchange around ${data.name.toLowerCase()} with ${qCount} community questions and ongoing peer answers.`,
      momentum: momentumTypes[idx % momentumTypes.length],
      momentumLabel: momentumLabels[idx % momentumLabels.length],
      sampleKeywords: tags.length > 0 ? tags : [catSlug, 'discussion'],
      questionCount: qCount,
    });
  });

  return results;
}

/**
 * POST /api/trending-topics
 * Analyzes questions using Gemini API (gemini-3.8-flash)
 */
app.post('/api/trending-topics', async (req, res) => {
  const { questions } = req.body;

  // If no questions sent or empty, provide baseline
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    const fallback = generateFallbackTrending([]);
    return res.json({ topics: fallback, source: 'fallback', count: fallback.length });
  }

  // Summarize input questions to keep prompt clean and efficient
  const sample = questions.slice(0, 25).map((q) => ({
    title: q.title,
    category: q.categoryName || q.categoryId,
    categorySlug: q.categoryId,
    tags: q.tagIds || [],
    answers: q.answerCount || 0,
    votes: q.upvotes || 0,
  }));

  const prompt = `Analyze these ${sample.length} current discussion questions from OpenAsk:
${JSON.stringify(sample, null, 2)}

Identify the top 3 to 4 prominent trending topics or discussion themes currently emerging.
For each trending topic, synthesize:
1. An engaging, descriptive topic headline (not just single words; make it an insightful area of inquiry).
2. The matching category slug and human-readable name.
3. A concise 1-2 sentence executive summary of what community members are asking and why it matters.
4. Momentum tier: hot, surging, emerging, or active.
5. A user-friendly momentum label (e.g. "🔥 Hot Topic", "⚡ Surging", "💡 Emerging", "💬 Active Debate").
6. 2-4 key conceptual keywords/tags.
7. Approximate number of questions in this topic group.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Using algorithmic trending analyzer.');
      const fallback = generateFallbackTrending(questions);
      return res.json({ topics: fallback, source: 'algorithmic', count: fallback.length });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert social knowledge analyst for OpenAsk. You analyze questions to extract high-signal discussion trends, synthesis themes, and community momentum.',
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: 'Slug or identifier for the topic' },
              title: { type: Type.STRING, description: 'Engaging topic headline' },
              categorySlug: { type: Type.STRING, description: 'Matching category slug' },
              categoryName: { type: Type.STRING, description: 'Category name' },
              summary: { type: Type.STRING, description: '1-2 sentence summary of discussion' },
              momentum: { type: Type.STRING, description: 'hot, surging, emerging, or active' },
              momentumLabel: { type: Type.STRING, description: 'Badge display label' },
              sampleKeywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              questionCount: { type: Type.INTEGER, description: 'Questions count' },
            },
            required: [
              'id',
              'title',
              'categorySlug',
              'categoryName',
              'summary',
              'momentum',
              'momentumLabel',
              'sampleKeywords',
            ],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return res.json({
        topics: parsed,
        source: 'gemini',
        model: 'gemini-3.8-flash',
        count: parsed.length,
      });
    }

    const fallback = generateFallbackTrending(questions);
    return res.json({ topics: fallback, source: 'fallback', count: fallback.length });
  } catch (err: any) {
    console.error('Error in /api/trending-topics:', err?.message || err);
    // Graceful fallback on any AI error
    const fallback = generateFallbackTrending(questions);
    return res.json({
      topics: fallback,
      source: 'fallback',
      error: err?.message || 'AI analysis fallback',
      count: fallback.length,
    });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  } else {
    // Development mode with Vite middlewares
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // Fallback for SPA routing in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`OpenAsk server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
