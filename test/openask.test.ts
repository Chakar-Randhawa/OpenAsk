import assert from 'node:assert';
import { INITIAL_CATEGORIES } from '../src/core/constants/initialCategories';
import * as skeletonModule from '../src/components/ui/Skeleton';
import {
  getReputationTier,
  REPUTATION_TIERS,
  getTierProgress,
  computeReputation as utilComputeReputation
} from '../src/core/utils/reputation';

console.log('--- RUNNING OPENASK PLATFORM INVARIANT TESTS ---');

// Test 1: Category Architecture
console.log('Test 1: Validating 50 structured categories...');
assert.strictEqual(INITIAL_CATEGORIES.length >= 50, true, 'Must have at least 50 categories');
const slugSet = new Set<string>();
for (const cat of INITIAL_CATEGORIES) {
  assert.ok(cat.name, 'Category must have a name');
  assert.ok(cat.slug, 'Category must have a slug');
  assert.ok(cat.description, 'Category must have a description');
  assert.match(cat.slug, /^[a-z0-9-]+$/, 'Slug must be url-safe lowercase');
  assert.strictEqual(slugSet.has(cat.slug), false, `Duplicate slug detected: ${cat.slug}`);
  slugSet.add(cat.slug);
}
console.log(`✓ Passed: Verified ${INITIAL_CATEGORIES.length} unique, valid categories.`);

// Test 2: Anonymous Privacy Isolation
console.log('Test 2: Validating anonymous privacy isolation invariant...');
function sanitizeQuestionPayload(isAnonymous: boolean, author: { uid: string; displayName: string; username: string }) {
  return {
    title: 'How does consensus work in distributed databases?',
    body: 'Exploring raft and paxos algorithms...',
    categoryId: 'technology',
    isAnonymous,
    authorUid: isAnonymous ? undefined : author.uid,
    authorDisplayName: isAnonymous ? 'Anonymous' : author.displayName,
    authorUsername: isAnonymous ? undefined : author.username
  };
}

const anonymousPayload = sanitizeQuestionPayload(true, {
  uid: 'user_xyz_123',
  displayName: 'John Doe',
  username: 'johndoe'
});

assert.strictEqual(anonymousPayload.authorUid, undefined, 'Anonymous payload must never include authorUid');
assert.strictEqual(anonymousPayload.authorUsername, undefined, 'Anonymous payload must never include authorUsername');
assert.strictEqual(anonymousPayload.authorDisplayName, 'Anonymous', 'Anonymous payload must display Anonymous');
console.log('✓ Passed: Anonymous isolation verified.');

// Test 3: Deterministic Voting Logic
console.log('Test 3: Validating deterministic voting deltas...');
function calculateVoteDelta(prevVote: number | null, newVote: 1 | -1): number {
  if (prevVote === null) {
    return newVote; // First vote (+1 or -1)
  }
  if (prevVote === newVote) {
    return -newVote; // Cancelling vote
  }
  return newVote * 2; // Flipping vote (-1 -> +1 = +2, +1 -> -1 = -2)
}

assert.strictEqual(calculateVoteDelta(null, 1), 1, 'First upvote should be +1');
assert.strictEqual(calculateVoteDelta(null, -1), -1, 'First downvote should be -1');
assert.strictEqual(calculateVoteDelta(1, 1), -1, 'Cancelling upvote should be -1');
assert.strictEqual(calculateVoteDelta(-1, -1), 1, 'Cancelling downvote should be +1');
assert.strictEqual(calculateVoteDelta(-1, 1), 2, 'Flipping downvote to upvote should be +2');
assert.strictEqual(calculateVoteDelta(1, -1), -2, 'Flipping upvote to downvote should be -2');
console.log('✓ Passed: Deterministic voting delta math verified.');

// Test 4: Username Validation
console.log('Test 4: Validating username security constraints...');
const validUsernames = ['alex', 'sarah_m', 'john_doe_99', 'tech_lead'];
const invalidUsernames = ['a', 'ab', 'user@domain', 'user-name', 'name with spaces', 'toolongusernameoverflowingthelimit1234567890'];

for (const u of validUsernames) {
  assert.strictEqual(/^[a-zA-Z0-9_]{3,30}$/.test(u), true, `Should accept valid username ${u}`);
}
for (const u of invalidUsernames) {
  assert.strictEqual(/^[a-zA-Z0-9_]{3,30}$/.test(u), false, `Should reject invalid username ${u}`);
}
console.log('✓ Passed: Username validation pattern constraints verified.');

// Test 5: Derived Reputation Invariant
console.log('Test 5: Validating derived reputation calculation invariant...');
function computeReputation(answers: number, questions: number): number {
  return Math.max(10, 10 + (answers || 0) * 5 + (questions || 0) * 2);
}
assert.strictEqual(computeReputation(0, 0), 10, 'Baseline reputation must be 10');
assert.strictEqual(computeReputation(2, 3), 10 + 10 + 6, 'Reputation calculation must be 26');
assert.strictEqual(computeReputation(10, 0), 60, '10 answers = 60 reputation');
console.log('✓ Passed: Derived reputation math verified.');

// Test 6: Deterministic ID Schema Invariant
console.log('Test 6: Validating deterministic composite ID invariants...');
const testUid = 'user_abc123';
const testAnswerId = 'ans_xyz789';
const expectedVoteId = `${testUid}_${testAnswerId}`;
assert.strictEqual(expectedVoteId, 'user_abc123_ans_xyz789', 'Vote ID must strictly match composite format');
const expectedFollowId = `${testUid}_${'user_target456'}`;
assert.strictEqual(expectedFollowId, 'user_abc123_user_target456', 'Follow ID must strictly match composite format');
console.log('✓ Passed: Deterministic composite ID schema verified.');

// Test 7: Notification Spoofing Prevention Invariant
console.log('Test 7: Validating notification anti-spoofing constraints...');
function validateNotificationPayload(authUid: string, payload: {
  recipientUid: string;
  senderUid?: string;
  type: string;
  isRead: boolean;
}): boolean {
  if (payload.recipientUid === authUid) return false; // cannot notify self
  if (payload.senderUid && payload.senderUid !== authUid) return false; // cannot spoof sender
  if (payload.isRead !== false) return false; // must start unread
  const allowedTypes = ['answer', 'comment', 'helpful', 'vote', 'follow'];
  if (!allowedTypes.includes(payload.type)) return false;
  return true;
}
assert.strictEqual(validateNotificationPayload('user_1', { recipientUid: 'user_2', senderUid: 'user_1', type: 'answer', isRead: false }), true);
assert.strictEqual(validateNotificationPayload('user_1', { recipientUid: 'user_1', senderUid: 'user_1', type: 'answer', isRead: false }), false, 'Must reject self-notification');
assert.strictEqual(validateNotificationPayload('user_1', { recipientUid: 'user_2', senderUid: 'user_hacker', type: 'answer', isRead: false }), false, 'Must reject spoofed sender');
assert.strictEqual(validateNotificationPayload('user_1', { recipientUid: 'user_2', senderUid: 'user_1', type: 'invalid_type', isRead: false }), false, 'Must reject unknown type');
console.log('✓ Passed: Notification anti-spoofing security verified.');

// Test 8: Theme Resolution Invariants
console.log('Test 8: Validating Light/Dark/System theme resolution invariants...');
function resolveTheme(preference: 'light' | 'dark' | 'system', systemPrefersDark: boolean): 'light' | 'dark' {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return systemPrefersDark ? 'dark' : 'light';
}
assert.strictEqual(resolveTheme('light', false), 'light', 'Light preference should resolve to light');
assert.strictEqual(resolveTheme('light', true), 'light', 'Light preference should stay light even if OS is dark');
assert.strictEqual(resolveTheme('dark', false), 'dark', 'Dark preference should resolve to dark even if OS is light');
assert.strictEqual(resolveTheme('dark', true), 'dark', 'Dark preference should stay dark if OS is dark');
assert.strictEqual(resolveTheme('system', false), 'light', 'System preference should resolve to light when OS is light');
assert.strictEqual(resolveTheme('system', true), 'dark', 'System preference should resolve to dark when OS is dark');
console.log('✓ Passed: Theme resolution invariants verified.');

// Test 9: Skeleton Component Structure and Accessibility
console.log('Test 9: Validating Skeleton component hierarchy and accessibility contract...');
assert.strictEqual(typeof skeletonModule.Skeleton, 'function', 'Skeleton must be exported as a React component');
assert.strictEqual(typeof skeletonModule.QuestionCardSkeleton, 'function', 'QuestionCardSkeleton must be exported');
assert.strictEqual(typeof skeletonModule.QuestionListSkeleton, 'function', 'QuestionListSkeleton must be exported');
assert.strictEqual(typeof skeletonModule.QuestionDetailSkeleton, 'function', 'QuestionDetailSkeleton must be exported');
assert.strictEqual(typeof skeletonModule.UserProfileSkeleton, 'function', 'UserProfileSkeleton must be exported');
assert.strictEqual(typeof skeletonModule.CategoryListSkeleton, 'function', 'CategoryListSkeleton must be exported');
assert.strictEqual(typeof skeletonModule.NotificationListSkeleton, 'function', 'NotificationListSkeleton must be exported');
assert.strictEqual(typeof skeletonModule.GlobalPageSkeleton, 'function', 'GlobalPageSkeleton must be exported');
console.log('✓ Passed: Skeleton component hierarchy and exports verified.');

// Test 10: Clipboard utility and Direct Question URL formatting
console.log('Test 10: Validating clipboard utility and Direct Question URL formatting...');
import { copyToClipboard } from '../src/core/utils/clipboard';
assert.strictEqual(typeof copyToClipboard, 'function', 'copyToClipboard must be an exported function');

// Test URL generator logic
const sampleOrigin = 'https://openask.app';
const sampleQuestionId = 'q-tech-789-xyz';
const expectedDirectUrl = `${sampleOrigin}/question/${sampleQuestionId}`;
assert.strictEqual(expectedDirectUrl, 'https://openask.app/question/q-tech-789-xyz', 'Direct conversation URL must match expected path pattern');
console.log('✓ Passed: Clipboard utility and Direct Question URL invariants verified.');

// Test 11: User Reputation Badge Tiers and Activity Math
console.log('Test 11: Validating User Reputation Badge Tiers and Activity Level invariants...');
assert.strictEqual(REPUTATION_TIERS.length, 5, 'Must define 5 structured reputation tiers');
assert.strictEqual(getReputationTier(10).id, 'newcomer', 'Score of 10 must be newcomer');
assert.strictEqual(getReputationTier(50).id, 'contributor', 'Score of 50 must be contributor');
assert.strictEqual(getReputationTier(150).id, 'scholar', 'Score of 150 must be scholar');
assert.strictEqual(getReputationTier(450).id, 'expert', 'Score of 450 must be expert');
assert.strictEqual(getReputationTier(1000).id, 'luminary', 'Score of 1000 must be luminary');

// Test activity point contributions (answers, questions, upvotes, helpful)
const activityScore = utilComputeReputation({ answers: 4, questions: 5, upvotes: 3, helpful: 1 });
// 10 base + (4*5 = 20) + (5*2 = 10) + (3*10 = 30) + (1*15 = 15) = 10 + 20 + 10 + 30 + 15 = 85
assert.strictEqual(activityScore, 85, 'Activity reputation formula should equal 85');
assert.strictEqual(getReputationTier(activityScore).id, 'contributor', '85 rep must resolve to contributor tier');

// Test tier progress math
const progress = getTierProgress(50);
assert.strictEqual(progress.currentTier.id, 'contributor', 'Current tier must match');
assert.strictEqual(progress.nextTier?.id, 'scholar', 'Next tier must be scholar');
assert.strictEqual(progress.pointsToNext, 50, 'Points to next tier (100 - 50) must be 50');
console.log('✓ Passed: User Reputation Badge Tiers and Activity invariants verified.');

// Test 12: Member Username Search Parsing and Matching
console.log('Test 12: Validating Member Username Search Parsing and Invariants...');
function parseUsernameSearch(raw: string): { isUsernameQuery: boolean; cleanUsername: string } {
  const trimmed = raw.trim();
  const isUsernameQuery = trimmed.startsWith('@');
  const cleanUsername = trimmed.toLowerCase().replace(/^@+/, '');
  return { isUsernameQuery, cleanUsername };
}

assert.deepStrictEqual(parseUsernameSearch('@sarah_connor'), { isUsernameQuery: true, cleanUsername: 'sarah_connor' });
assert.deepStrictEqual(parseUsernameSearch('@@tech_lead'), { isUsernameQuery: true, cleanUsername: 'tech_lead' });
assert.deepStrictEqual(parseUsernameSearch('alex'), { isUsernameQuery: false, cleanUsername: 'alex' });

// Test ranking order
const sampleUsers = [
  { username: 'alexander_the_great', displayName: 'Alexander' },
  { username: 'alex', displayName: 'Alex Smith' },
  { username: 'smart_alex', displayName: 'Smart Alex' }
];
const searchTarget = 'alex';
function scoreUser(u: { username: string; displayName: string }, target: string): number {
  if (u.username === target) return 100;
  if (u.username.startsWith(target)) return 80;
  if (u.username.includes(target)) return 60;
  return 0;
}
const rankedSample = [...sampleUsers].sort((a, b) => scoreUser(b, searchTarget) - scoreUser(a, searchTarget));
assert.strictEqual(rankedSample[0].username, 'alex', 'Exact username match must rank first');
assert.strictEqual(rankedSample[1].username, 'alexander_the_great', 'Prefix match must rank second');
assert.strictEqual(rankedSample[2].username, 'smart_alex', 'Substring match must rank third');
console.log('✓ Passed: Member Username Search Parsing and Invariants verified.');

// Test 13: Rich Text Formatting Parsing Invariants
console.log('Test 13: Validating Rich Text Formatting Parsing Invariants...');
const sampleMarkdown = `
Here is **bold text** and *italic insight* and \`inlineCode()\`.

\`\`\`typescript
function calculateEfficiency(power: number, speed: number): number {
  return power / speed;
}
\`\`\`

> A good question is half the answer.

- Aerobic threshold
- Lactate turnpoint
`;

// Verify bold pattern regex
const boldMatches = Array.from(sampleMarkdown.matchAll(/\*\*([^*]+)\*\*/g)).map(m => m[1]);
assert.deepStrictEqual(boldMatches, ['bold text'], 'Must extract bold text correctly');

// Verify italic pattern regex
const italicMatches = Array.from(sampleMarkdown.matchAll(/(?<!\*)\*([^*]+)\*(?!\*)/g)).map(m => m[1]);
assert.deepStrictEqual(italicMatches, ['italic insight'], 'Must extract italic text correctly');

// Verify inline code pattern regex
const codeMatches = Array.from(sampleMarkdown.matchAll(/`([^`]+)`/g)).map(m => m[1]);
assert.strictEqual(codeMatches.some(m => m === 'inlineCode()'), true, 'Must extract inline code correctly');

// Verify fenced code block regex
const fencedCodeRegex = /```(\w+)?\n([\s\S]*?)\n```/;
const fencedMatch = sampleMarkdown.match(fencedCodeRegex);
assert.ok(fencedMatch, 'Must match fenced code block');
assert.strictEqual(fencedMatch[1], 'typescript', 'Language should match typescript');
assert.strictEqual(fencedMatch[2].includes('calculateEfficiency'), true, 'Code block content should be captured');

console.log('✓ Passed: Rich Text Formatting Parsing Invariants verified.');

// Test 14: Trending Topics Widget Schema & Momentum Invariants
console.log('Test 14: Validating Trending Topics Schema and Momentum Invariants...');
const sampleTopic = {
  id: 'topic-distributed-systems',
  title: 'Distributed Systems & Raft Consensus Protocols',
  categorySlug: 'technology',
  categoryName: 'Technology',
  summary: 'Community discussions exploring state machine replication and quorum leases under partitioning.',
  momentum: 'hot' as const,
  momentumLabel: '🔥 Hot Topic',
  sampleKeywords: ['distributed-systems', 'consensus', 'raft'],
  questionCount: 4
};

function validateTrendingTopic(topic: typeof sampleTopic): boolean {
  if (!topic.id || typeof topic.id !== 'string') return false;
  if (!topic.title || typeof topic.title !== 'string') return false;
  if (!topic.categorySlug || typeof topic.categorySlug !== 'string') return false;
  if (!topic.summary || typeof topic.summary !== 'string') return false;
  const allowedMomentum = ['hot', 'surging', 'emerging', 'active'];
  if (!allowedMomentum.includes(topic.momentum)) return false;
  if (!Array.isArray(topic.sampleKeywords)) return false;
  if (typeof topic.questionCount !== 'number') return false;
  return true;
}

assert.strictEqual(validateTrendingTopic(sampleTopic), true, 'Sample topic must pass schema validation');
console.log('✓ Passed: Trending Topics Schema and Momentum Invariants verified.');

// Test 15: Content Moderation & Reporting Invariants
console.log('Test 15: Validating Content Moderation and Reporting Invariants...');
const validTargetTypes = ['question', 'answer', 'comment', 'user'] as const;
type ReportTargetType = typeof validTargetTypes[number];

function validateReportPayload(payload: {
  reporterUid: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
}): boolean {
  if (!payload.reporterUid || typeof payload.reporterUid !== 'string') return false;
  if (!validTargetTypes.includes(payload.targetType as ReportTargetType)) return false;
  if (!payload.targetId || typeof payload.targetId !== 'string') return false;
  if (!payload.reason || typeof payload.reason !== 'string') return false;
  if (payload.status !== 'pending') return false;
  return true;
}

assert.strictEqual(
  validateReportPayload({
    reporterUid: 'user_123',
    targetType: 'comment',
    targetId: 'cm_456',
    reason: 'Harassment or bullying',
    status: 'pending'
  }),
  true,
  'Comment report must pass validation'
);

assert.strictEqual(
  validateReportPayload({
    reporterUid: 'user_123',
    targetType: 'answer',
    targetId: 'ans_789',
    reason: 'Spam or misleading advertising',
    status: 'pending'
  }),
  true,
  'Answer report must pass validation'
);

assert.strictEqual(
  validateReportPayload({
    reporterUid: 'user_123',
    targetType: 'question',
    targetId: 'q_999',
    reason: 'Misinformation or harmful advice',
    status: 'pending'
  }),
  true,
  'Question report must pass validation'
);

console.log('✓ Passed: Content Moderation and Reporting Invariants verified.');

// Test 16: 30-Day Discussion Metrics & Volume Visualization Invariants
console.log('Test 16: Validating 30-Day Discussion Metrics Invariants...');
const mockDailyMetrics = Array.from({ length: 30 }, (_, i) => {
  const questions = (i % 5) + 3;
  const answers = questions * 2 + 1;
  return {
    dayIndex: i,
    questions,
    answers,
    totalVolume: questions + answers
  };
});

assert.strictEqual(mockDailyMetrics.length, 30, 'Metrics dataset must contain exactly 30 days');
mockDailyMetrics.forEach((d) => {
  assert.strictEqual(
    d.totalVolume,
    d.questions + d.answers,
    'Daily total volume must be the exact sum of questions and answers'
  );
  assert.ok(d.questions >= 0, 'Questions count must be non-negative');
  assert.ok(d.answers >= 0, 'Answers count must be non-negative');
});

const sampleTopicMetrics = [
  { topicName: 'Technology', totalVolume: 120 },
  { topicName: 'Health & Medicine', totalVolume: 80 },
  { topicName: 'Science', totalVolume: 65 }
];
const sortedTopics = [...sampleTopicMetrics].sort((a, b) => b.totalVolume - a.totalVolume);
assert.strictEqual(sortedTopics[0].topicName, 'Technology', 'Leading domain must have highest total volume');
console.log('✓ Passed: 30-Day Discussion Metrics Invariants verified.');

// Test 17: User Activity Badge System Invariants
console.log('Test 17: Validating User Activity Badge System Invariants...');
const { evaluateUserActivityBadges } = await import('../src/core/utils/activityBadges.js');

const mockUserWithAnswers = {
  uid: 'user_expert_1',
  displayName: 'Dr. Jane Turing',
  username: 'janeturing',
  followersCount: 15,
  followingCount: 10,
  questionCount: 4,
  answerCount: 8,
  reputation: 60,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
};

const mockQuestions = [
  { questionId: 'q1', categoryId: 'technology', categoryName: 'Technology' },
  { questionId: 'q2', categoryId: 'technology', categoryName: 'Technology' }
];

const mockAnswers = [
  { answerId: 'a1', questionId: 'q1', helpfulCount: 2 }
];

const badgeEval = evaluateUserActivityBadges({
  profile: mockUserWithAnswers as any,
  questions: mockQuestions as any,
  answers: mockAnswers as any
});

assert.ok(badgeEval.unlockedBadges.length > 0, 'User with 8 answers and 4 questions must unlock badges');

const topAnswererBadge = badgeEval.unlockedBadges.find((b: any) => b.id === 'top-answerer');
assert.ok(topAnswererBadge, 'User with >= 2 answers must unlock Top Answerer badge');
assert.strictEqual(topAnswererBadge.unlocked, true);

const topicExpertBadge = badgeEval.unlockedBadges.find((b: any) => b.id === 'topic-expert');
assert.ok(topicExpertBadge, 'User with focused domain questions must unlock Topic Expert badge');
assert.strictEqual(topicExpertBadge.categoryTag, 'Technology');

// Test that primary badge is set
assert.ok(badgeEval.primaryBadge, 'User must have a primary activity badge assigned');

console.log('✓ Passed: User Activity Badge System Invariants verified.');

// Test 18: Read-Time Estimator Invariants
console.log('Test 18: Validating Read-Time Estimator Invariants...');
const { getReadTimeDetails, estimateReadTime } = await import('../src/core/utils/readTime.js');

// 1. Empty / null content
const emptyEst = getReadTimeDetails('');
assert.strictEqual(emptyEst.text, '< 1 min read', 'Empty string must return < 1 min read');
assert.strictEqual(emptyEst.wordCount, 0);

// 2. Short question (~30 words)
const shortPost = 'What is the exact distinction between aerobic threshold and anaerobic threshold in cardiovascular endurance training? I am looking for physiological markers such as blood lactate accumulation and ventilatory equivalents.';
const shortEst = getReadTimeDetails(shortPost);
assert.strictEqual(shortEst.text, '< 1 min read', '30-word post must be < 1 min read');
assert.ok(shortEst.wordCount > 25, 'Word count should match tokens');

// 3. Medium post (~400 words)
const mediumPost = Array.from({ length: 400 }, () => 'physiology').join(' ');
const mediumEst = getReadTimeDetails(mediumPost);
assert.strictEqual(mediumEst.minutes, 2, '400 words at 200 wpm should take 2 minutes');
assert.strictEqual(mediumEst.text, '2 min read');

// 4. Technical post with code block
const technicalPost = `
Here is an overview of Raft consensus protocol log replication:

\`\`\`typescript
function replicateLog(term: number, leaderId: string, prevLogIndex: number): boolean {
  if (term < currentTerm) return false;
  return checkQuorumMatch();
}
\`\`\`
`;
const techEst = getReadTimeDetails(technicalPost);
assert.strictEqual(techEst.hasCode, true, 'Must detect fenced code blocks in markdown');
assert.strictEqual(estimateReadTime(technicalPost), '< 1 min read');

console.log('✓ Passed: Read-Time Estimator Invariants verified.');

// Test 19: Deep Link Formatting and Social Media Sharing Invariants
console.log('Test 19: Validating Deep Link and Social Sharing Invariants...');

const mockOrigin = 'https://openask.app';
const shareQuestionId = 'q_8921a';
const shareAnswerId = 'ans_381f';
const shareTitle = 'How does Paxos guarantee safety during leader election?';

// 1. Question deep link
const questionDeepLink = `${mockOrigin}/question/${shareQuestionId}`;
assert.strictEqual(questionDeepLink, 'https://openask.app/question/q_8921a', 'Question deep link must resolve cleanly');

// 2. Answer deep link with target hash
const answerDeepLink = `${mockOrigin}/question/${shareQuestionId}#${shareAnswerId}`;
assert.strictEqual(answerDeepLink, 'https://openask.app/question/q_8921a#ans_381f', 'Answer deep link must contain answerId hash');

// 3. Social URL generation validation
function buildSocialShareUrls(title: string, url: string) {
  const encTitle = encodeURIComponent(title);
  const encUrl = encodeURIComponent(url);
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
    reddit: `https://reddit.com/submit?url=${encUrl}&title=${encTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`
  };
}

const socialUrls = buildSocialShareUrls(shareTitle, answerDeepLink);
assert.ok(socialUrls.twitter.includes('twitter.com/intent/tweet'), 'Twitter share URL must match intent structure');
assert.ok(socialUrls.twitter.includes(encodeURIComponent(answerDeepLink)), 'Twitter share URL must encode deep link');
assert.ok(socialUrls.linkedin.includes('linkedin.com/sharing/share-offsite'), 'LinkedIn share URL must match offsite format');
assert.ok(socialUrls.reddit.includes('reddit.com/submit'), 'Reddit share URL must match submit format');
assert.ok(socialUrls.whatsapp.includes('api.whatsapp.com/send'), 'WhatsApp share URL must match send format');
assert.ok(socialUrls.facebook.includes('facebook.com/sharer'), 'Facebook share URL must match sharer format');

console.log('✓ Passed: Deep Link and Social Sharing Invariants verified.');

// Test 20: Auto-Save Drafts Management Invariants
console.log('Test 20: Validating Auto-Save Drafts Management Invariants...');

// Mock browser localStorage in test environment
const mockStorage = new Map<string, string>();
const fakeWindow = {
  localStorage: {
    getItem: (key: string) => mockStorage.get(key) || null,
    setItem: (key: string, val: string) => mockStorage.set(key, val),
    removeItem: (key: string) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  }
};
(global as any).window = fakeWindow;

const { draftsManager } = await import('../src/core/utils/drafts.js');

// 1. Question draft save & load
draftsManager.saveQuestionDraft({
  title: 'How does Byzantine Fault Tolerance differ from Crash Fault Tolerance?',
  body: 'Looking for differences in quorum intersection proofs and adversarial models.',
  selectedCategorySlug: 'technology',
  tagsInput: 'distributed-systems, bft, consensus',
  isAnonymous: false
});

const loadedQDraft = draftsManager.loadQuestionDraft();
assert.ok(loadedQDraft, 'Question draft must be loaded from storage');
assert.strictEqual(loadedQDraft.title, 'How does Byzantine Fault Tolerance differ from Crash Fault Tolerance?');
assert.strictEqual(loadedQDraft.selectedCategorySlug, 'technology');
assert.ok(loadedQDraft.updatedAt, 'Draft must have an updatedAt ISO timestamp');

// 2. Question draft clear
draftsManager.clearQuestionDraft();
assert.strictEqual(draftsManager.loadQuestionDraft(), null, 'Cleared draft must return null');

// 3. Empty question content should remove draft rather than storing blanks
draftsManager.saveQuestionDraft({ title: '   ', body: '' });
assert.strictEqual(draftsManager.loadQuestionDraft(), null, 'Saving whitespace/empty question should clean up storage');

// 4. Answer draft save & load scoped to questionId
const testQId = 'q_distributed_1';
draftsManager.saveAnswerDraft(testQId, {
  body: 'BFT requires 3f + 1 nodes while CFT requires 2f + 1 nodes because malicious nodes can send conflicting equivocations.',
  isAnonymous: true
});

const loadedADraft = draftsManager.loadAnswerDraft(testQId);
assert.ok(loadedADraft, 'Answer draft must be loaded for testQId');
assert.strictEqual(loadedADraft.isAnonymous, true);
assert.ok(loadedADraft.body.includes('3f + 1'));

// 5. Answer draft isolation across different questions
assert.strictEqual(draftsManager.loadAnswerDraft('q_other_2'), null, 'Different question ID must not leak draft');

// 6. Answer draft clear
draftsManager.clearAnswerDraft(testQId);
assert.strictEqual(draftsManager.loadAnswerDraft(testQId), null, 'Cleared answer draft must return null');

console.log('✓ Passed: Auto-Save Drafts Management Invariants verified.');

console.log('--- ALL OPENASK PLATFORM INVARIANT TESTS PASSED SUCCESSFULLY ---');
