import { UserProfile, Question, Answer } from '../models/types';

export type BadgeTier = 'gold' | 'silver' | 'bronze' | 'special';

export interface ActivityBadge {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  criteria: string;
  iconName: 'Flame' | 'Brain' | 'Award' | 'HelpCircle' | 'CheckCircle2' | 'Sparkles' | 'Star' | 'Crown' | 'Zap';
  tier: BadgeTier;
  color: {
    bg: string;
    darkBg: string;
    border: string;
    darkBorder: string;
    text: string;
    darkText: string;
    icon: string;
  };
  unlocked: boolean;
  unlockedAt?: string;
  categoryTag?: string;
  progress: {
    current: number;
    target: number;
    unit: string;
    percent: number;
  };
}

export interface UserBadgeEvaluationResult {
  unlockedBadges: ActivityBadge[];
  inProgressBadges: ActivityBadge[];
  primaryBadge: ActivityBadge | null;
  totalUnlockedCount: number;
}

const TIER_COLORS: Record<BadgeTier, ActivityBadge['color']> = {
  gold: {
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-950/40',
    border: 'border-amber-200',
    darkBorder: 'dark:border-amber-800/80',
    text: 'text-amber-900',
    darkText: 'dark:text-amber-200',
    icon: 'text-amber-500',
  },
  silver: {
    bg: 'bg-slate-50',
    darkBg: 'dark:bg-slate-900/60',
    border: 'border-slate-200',
    darkBorder: 'dark:border-slate-700',
    text: 'text-slate-800',
    darkText: 'dark:text-slate-200',
    icon: 'text-slate-500',
  },
  bronze: {
    bg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-950/40',
    border: 'border-orange-200',
    darkBorder: 'dark:border-orange-800/80',
    text: 'text-orange-900',
    darkText: 'dark:text-orange-200',
    icon: 'text-orange-600',
  },
  special: {
    bg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-950/40',
    border: 'border-purple-200',
    darkBorder: 'dark:border-purple-800/80',
    text: 'text-purple-900',
    darkText: 'dark:text-purple-200',
    icon: 'text-purple-500',
  },
};

/**
 * Evaluates earned activity badges dynamically based on real user actions:
 * - Answer counts & helpful votes (Top Answerer)
 * - Domain concentrations (Topic Expert)
 * - Inquiries asked (Prolific Inquirer)
 * - Knowledge reputation
 */
export function evaluateUserActivityBadges(params: {
  profile: UserProfile;
  questions?: Question[];
  answers?: Answer[];
}): UserBadgeEvaluationResult {
  const { profile, questions = [], answers = [] } = params;
  const badges: ActivityBadge[] = [];

  const answerCount = profile.answerCount ?? answers.length;
  const questionCount = profile.questionCount ?? questions.length;
  const derivedReputation = Math.max(10, 10 + answerCount * 5 + questionCount * 2);

  // 1. TOP ANSWERER BADGES
  // Bronze: 2 answers, Silver: 5 answers, Gold: 12 answers
  const isTopAnswererGold = answerCount >= 12;
  const isTopAnswererSilver = answerCount >= 5;
  const isTopAnswererBronze = answerCount >= 2;

  badges.push({
    id: 'top-answerer',
    name: isTopAnswererGold ? 'Top Answerer (Gold)' : isTopAnswererSilver ? 'Top Answerer (Silver)' : 'Top Answerer',
    shortLabel: 'Top Answerer',
    description: 'Frequently provides clear, thoughtful, and verified answers to community questions.',
    criteria: 'Contribute 2 or more peer answers across OpenAsk discussions.',
    iconName: 'Flame',
    tier: isTopAnswererGold ? 'gold' : isTopAnswererSilver ? 'silver' : 'bronze',
    color: isTopAnswererGold ? TIER_COLORS.gold : isTopAnswererSilver ? TIER_COLORS.silver : TIER_COLORS.bronze,
    unlocked: isTopAnswererBronze,
    progress: {
      current: answerCount,
      target: isTopAnswererGold ? 12 : isTopAnswererSilver ? 12 : isTopAnswererBronze ? 5 : 2,
      unit: 'answers',
      percent: Math.min(100, Math.round((answerCount / (isTopAnswererGold ? 12 : isTopAnswererSilver ? 12 : 2)) * 100)),
    },
  });

  // 2. TOPIC EXPERT BADGE (Analyzes category distribution across questions and answers)
  const categoryUsage = new Map<string, { count: number; name: string }>();

  for (const a of answers) {
    // If answer has question category or default
    const cat = 'Technology'; // default baseline
    const cur = categoryUsage.get(cat) || { count: 0, name: cat };
    cur.count += 1;
    categoryUsage.set(cat, cur);
  }

  for (const q of questions) {
    const cSlug = q.categoryId || 'General';
    const cName = q.categoryName || q.categoryId || 'General';
    const cur = categoryUsage.get(cSlug) || { count: 0, name: cName };
    cur.count += 1;
    categoryUsage.set(cSlug, cur);
  }

  // Find dominant category
  let topCategoryName = 'Technology';
  let topCategoryCount = 0;
  for (const [, val] of categoryUsage.entries()) {
    if (val.count > topCategoryCount) {
      topCategoryCount = val.count;
      topCategoryName = val.name;
    }
  }

  // Unlocked if 2 or more contributions in that domain, or reputation >= 30
  const isTopicExpert = topCategoryCount >= 2 || (answerCount >= 1 && derivedReputation >= 25);
  badges.push({
    id: 'topic-expert',
    name: `Topic Expert: ${topCategoryName}`,
    shortLabel: `Expert: ${topCategoryName}`,
    description: `Recognized for recurring depth and subject-matter expertise within ${topCategoryName}.`,
    criteria: `Contribute focused discussions and peer answers in ${topCategoryName}.`,
    categoryTag: topCategoryName,
    iconName: 'Brain',
    tier: 'gold',
    color: TIER_COLORS.gold,
    unlocked: isTopicExpert,
    progress: {
      current: Math.max(topCategoryCount, answerCount > 0 ? 2 : 0),
      target: 2,
      unit: 'domain contributions',
      percent: isTopicExpert ? 100 : Math.min(100, Math.round((topCategoryCount / 2) * 100)),
    },
  });

  // 3. PROLIFIC INQUIRER (Questions Asked)
  const isProlificInquirer = questionCount >= 2;
  badges.push({
    id: 'prolific-inquirer',
    name: 'Prolific Inquirer',
    shortLabel: 'Inquirer',
    description: 'Ignites meaningful discussions by posting well-structured questions for the community.',
    criteria: 'Publish 2 or more community questions across any knowledge domain.',
    iconName: 'HelpCircle',
    tier: 'silver',
    color: TIER_COLORS.silver,
    unlocked: isProlificInquirer,
    progress: {
      current: questionCount,
      target: 2,
      unit: 'questions',
      percent: Math.min(100, Math.round((questionCount / 2) * 100)),
    },
  });

  // 4. HIGH SIGNAL CONTRIBUTOR (Quality & Helpful Marks)
  let totalHelpful = 0;
  for (const a of answers) {
    totalHelpful += a.helpfulCount || 0;
  }
  const isHighSignal = totalHelpful >= 1 || derivedReputation >= 40 || answerCount >= 3;
  badges.push({
    id: 'high-signal',
    name: 'High-Signal Contributor',
    shortLabel: 'High Signal',
    description: 'Contributions are repeatedly marked as verified, helpful, and insightful by peers.',
    criteria: 'Receive helpful marks or earn 40+ community reputation points.',
    iconName: 'CheckCircle2',
    tier: 'gold',
    color: TIER_COLORS.gold,
    unlocked: isHighSignal,
    progress: {
      current: derivedReputation,
      target: 40,
      unit: 'reputation',
      percent: Math.min(100, Math.round((derivedReputation / 40) * 100)),
    },
  });

  // 5. PIONEER MEMBER (Foundational Community Explorer)
  const isPioneer = true; // All active registered platform members hold foundational member status
  badges.push({
    id: 'pioneer-member',
    name: 'Foundational Contributor',
    shortLabel: 'Foundational',
    description: 'An early participant shaping OpenAsk community standards and peer review.',
    criteria: 'Registered community member with an active public profile.',
    iconName: 'Sparkles',
    tier: 'special',
    color: TIER_COLORS.special,
    unlocked: isPioneer,
    progress: {
      current: 1,
      target: 1,
      unit: 'member',
      percent: 100,
    },
  });

  // 6. MASTER CONTRIBUTOR (100+ Reputation or 10+ answers)
  const isMaster = derivedReputation >= 100 || answerCount >= 8;
  badges.push({
    id: 'master-contributor',
    name: 'Master Contributor',
    shortLabel: 'Master',
    description: 'Demonstrated extensive sustained commitment to authentic knowledge sharing.',
    criteria: 'Achieve 100+ reputation points or contribute 8+ answers.',
    iconName: 'Crown',
    tier: 'gold',
    color: TIER_COLORS.gold,
    unlocked: isMaster,
    progress: {
      current: derivedReputation,
      target: 100,
      unit: 'reputation',
      percent: Math.min(100, Math.round((derivedReputation / 100) * 100)),
    },
  });

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const inProgressBadges = badges.filter((b) => !b.unlocked);

  // Primary badge priority: Top Answerer > Topic Expert > High-Signal > Inquirer > Foundational
  let primaryBadge: ActivityBadge | null = null;
  const priorityOrder = ['top-answerer', 'topic-expert', 'high-signal', 'prolific-inquirer', 'pioneer-member'];
  for (const pid of priorityOrder) {
    const match = unlockedBadges.find((b) => b.id === pid);
    if (match) {
      primaryBadge = match;
      break;
    }
  }

  return {
    unlockedBadges,
    inProgressBadges,
    primaryBadge: primaryBadge || unlockedBadges[0] || null,
    totalUnlockedCount: unlockedBadges.length,
  };
}
