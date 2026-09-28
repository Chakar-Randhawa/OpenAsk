# OpenAsk Security Specification

## 1. Data Invariants

1. **Authentication Integrity**: All write operations (creating users, questions, answers, comments, votes, follows, reports) require authenticated users (`request.auth != null`).
2. **Anonymous Privacy Guarantee**: When `isAnonymous` is `true`, the public question or answer document MUST NOT expose the author's UID, username, avatar, or email. The ownership is isolated in `questionOwners/{questionId}` and `answerOwners/{answerId}`, which are only readable by the owner (`request.auth.uid == resource.data.ownerUid`) or admins.
3. **PII Isolation**: Sensitive data such as user email and personal notification preferences are strictly stored in `/users/{userId}/private/info` and readable/writable only by the owner `userId`.
4. **Single-Vote Invariant**: A user can cast only one vote per answer. The document ID in `/votes/{voteId}` is deterministically `${request.auth.uid}_${answerId}` so users cannot create duplicate votes.
5. **Relational Sync & Ownership Immutability**: On update, `authorUid`, `ownerUid`, `createdAt`, and `questionId` cannot be mutated (`incoming().field == existing().field`).
6. **No Client Role Escalation**: Normal users cannot modify `reputation`, `role`, or `isAdmin`. Admin operations require existence in `/admins/{request.auth.uid}`.
7. **Report Immutability**: Normal users can create abuse reports for review, but cannot read or edit existing reports. Only admins can read/update reports.
8. **Private Notifications**: Notifications can only be listed/read by the recipient user (`request.auth.uid == resource.data.recipientUid`).

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)

1. **Identity Spoofing in Question**: Non-admin user attempts to create a question with `authorUid` set to another user's UID.
2. **PII Snooping**: User B attempts to `get` `/users/userA/private/info`.
3. **Anonymous De-anonymization**: Non-owner attempts to read `/questionOwners/{questionId}`.
4. **Vote Counter Injection**: Client attempts to write directly to a question or answer's `voteCount` without going through deterministic vote records.
5. **Shadow Field Injection**: User updates their profile with `{ isAdmin: true }` or `{ reputation: 999999 }`.
6. **Report Tampering**: User attempts to update or delete another user's report in `/reports/{reportId}`.
7. **Cross-User Bookmark Stealing**: User A attempts to list or delete bookmarks in `/savedItems/` belonging to User B.
8. **Notification Snooping**: User A queries `/notifications` where `recipientUid == 'userB'`.
9. **Unbounded String / Denial of Wallet**: Attacker sends a 500KB payload in `title` or `commentId`.
10. **ID Poisoning**: Attacker sends special characters or path traversals in document IDs.
11. **Malicious Follow Forgery**: User A attempts to forge a follow relationship on behalf of User B (`followerUid != request.auth.uid`).
12. **Comment Forgery on Deleted Item**: User writes a comment with invalid target reference.
