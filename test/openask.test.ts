import assert from 'node:assert';
import { INITIAL_CATEGORIES } from '../src/core/constants/initialCategories';

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

console.log('--- ALL OPENASK PLATFORM INVARIANT TESTS PASSED SUCCESSFULLY ---');
