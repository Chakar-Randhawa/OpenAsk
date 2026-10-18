export type ReputationTierLevel = 'newcomer' | 'contributor' | 'scholar' | 'expert' | 'luminary';

export interface ReputationTier {
  id: ReputationTierLevel;
  name: string;
  minReputation: number;
  maxReputation: number;
  badgeLabel: string;
  iconName: 'Sparkles' | 'Award' | 'BookOpen' | 'Star' | 'Crown';
  colorClasses: {
    bg: string;
    text: string;
    border: string;
    darkBg: string;
    darkText: string;
    darkBorder: string;
    dot: string;
  };
  description: string;
}

export const REPUTATION_TIERS: ReputationTier[] = [
  {
    id: 'newcomer',
    name: 'Newcomer',
    minReputation: 0,
    maxReputation: 29,
    badgeLabel: 'Newcomer',
    iconName: 'Sparkles',
    colorClasses: {
      bg: 'bg-neutral-100',
      text: 'text-neutral-700',
      border: 'border-neutral-200',
      darkBg: 'dark:bg-neutral-800',
      darkText: 'dark:text-neutral-300',
      darkBorder: 'dark:border-neutral-700',
      dot: 'bg-neutral-400'
    },
    description: 'New community explorer'
  },
  {
    id: 'contributor',
    name: 'Contributor',
    minReputation: 30,
    maxReputation: 99,
    badgeLabel: 'Contributor',
    iconName: 'Award',
    colorClasses: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      darkBg: 'dark:bg-blue-950/40',
      darkText: 'dark:text-blue-300',
      darkBorder: 'dark:border-blue-800/80',
      dot: 'bg-blue-500'
    },
    description: 'Active contributor providing helpful answers'
  },
  {
    id: 'scholar',
    name: 'Rising Scholar',
    minReputation: 100,
    maxReputation: 299,
    badgeLabel: 'Scholar',
    iconName: 'BookOpen',
    colorClasses: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      darkBg: 'dark:bg-amber-950/40',
      darkText: 'dark:text-amber-300',
      darkBorder: 'dark:border-amber-800/80',
      dot: 'bg-amber-500'
    },
    description: 'Recognized for high-quality insights and guidance'
  },
  {
    id: 'expert',
    name: 'Domain Expert',
    minReputation: 300,
    maxReputation: 749,
    badgeLabel: 'Expert',
    iconName: 'Star',
    colorClasses: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      darkBg: 'dark:bg-emerald-950/40',
      darkText: 'dark:text-emerald-300',
      darkBorder: 'dark:border-emerald-800/80',
      dot: 'bg-emerald-500'
    },
    description: 'Top-tier accuracy and distinguished community standing'
  },
  {
    id: 'luminary',
    name: 'Community Luminary',
    minReputation: 750,
    maxReputation: Infinity,
    badgeLabel: 'Luminary',
    iconName: 'Crown',
    colorClasses: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      darkBg: 'dark:bg-purple-950/40',
      darkText: 'dark:text-purple-300',
      darkBorder: 'dark:border-purple-800/80',
      dot: 'bg-purple-500'
    },
    description: 'Pillar of the OpenAsk ecosystem'
  }
];

/**
 * Computes derived reputation based on community activity and upvotes:
 * - Base starting reputation: 10
 * - Each published answer: +5
 * - Each published question: +2
 * - Each upvote/vote delta received: +10
 * - Each helpful mark received: +15
 */
export function computeReputation(params: {
  answers?: number;
  questions?: number;
  upvotes?: number;
  helpful?: number;
  acceptedAnswers?: number;
  curatedSolutions?: number;
  baseReputation?: number;
}): number {
  const base = params.baseReputation !== undefined ? params.baseReputation : 10;
  const fromAnswers = (params.answers || 0) * 5;
  const fromQuestions = (params.questions || 0) * 2;
  const fromUpvotes = (params.upvotes || 0) * 10;
  const fromHelpful = (params.helpful || 0) * 15;
  const fromAccepted = (params.acceptedAnswers || 0) * 15;
  const fromCurated = (params.curatedSolutions || 0) * 2;

  return Math.max(10, base + fromAnswers + fromQuestions + fromUpvotes + fromHelpful + fromAccepted + fromCurated);
}

/**
 * Resolves the appropriate ReputationTier based on reputation score
 */
export function getReputationTier(reputation: number): ReputationTier {
  const safeScore = Math.max(0, reputation || 0);
  for (const tier of REPUTATION_TIERS) {
    if (safeScore >= tier.minReputation && safeScore <= tier.maxReputation) {
      return tier;
    }
  }
  return REPUTATION_TIERS[REPUTATION_TIERS.length - 1];
}

/**
 * Gets progress towards next tier (0 to 100)
 */
export function getTierProgress(reputation: number): {
  currentTier: ReputationTier;
  nextTier: ReputationTier | null;
  percentage: number;
  pointsToNext: number;
} {
  const currentTier = getReputationTier(reputation);
  const currentIndex = REPUTATION_TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = currentIndex < REPUTATION_TIERS.length - 1 ? REPUTATION_TIERS[currentIndex + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      percentage: 100,
      pointsToNext: 0
    };
  }

  const range = nextTier.minReputation - currentTier.minReputation;
  const progress = Math.max(0, reputation - currentTier.minReputation);
  const percentage = Math.min(100, Math.round((progress / range) * 100));
  const pointsToNext = Math.max(0, nextTier.minReputation - reputation);

  return {
    currentTier,
    nextTier,
    percentage,
    pointsToNext
  };
}
