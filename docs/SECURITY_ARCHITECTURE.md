# OpenAsk — Security Architecture Specification

**Document:** `docs/SECURITY_ARCHITECTURE.md`  
**Security Model:** Zero-Trust Attribute-Based Access Control (ABAC)  
**Infrastructure:** Cloud Firestore & Firebase Authentication  
**Compliance:** Firebase Spark Tier (Free Tier) Compatibility  

---

## 1. Threat Model & Security Boundaries

OpenAsk is designed with a defense-in-depth model where the client application is treated as an untrusted environment. Every transaction, query, document creation, and field mutation is governed by server-enforced security rules.

```
+-------------------------------------------------------------+
|                     Client Browser (Untrusted)              |
|   - Anonymity toggle                                        |
|   - Voting UI                                               |
|   - Search & filters                                        |
+------------------------------+------------------------------+
                               |
                               | Signed JWT (request.auth)
                               v
+-------------------------------------------------------------+
|             Cloud Firestore Security Rules (Trusted)        |
|   - Default deny all access                                 |
|   - Anonymity authorUid omission check                      |
|   - Deterministic composite key enforcement                 |
|   - Protected counter and reputation diff checks            |
|   - Anti-spoofing sender/recipient verification             |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                  Firestore Document Database                |
|   /users/{uid}             /questions/{id}                  |
|   /users/{uid}/private     /questionOwners/{id} (Private)   |
|   /answers/{id}            /answerOwners/{id}   (Private)   |
|   /votes/{uid_ansId}       /notifications/{id}              |
+-------------------------------------------------------------+
```

---

## 2. PII Isolation & Private Subcollections

Sensitive account configuration and notification preferences are never exposed in the public user profile.

- **Public Profile (`/users/{uid}`):**
  - Fields: `uid`, `displayName`, `username`, `bio`, `photoUrl`, `followersCount`, `followingCount`, `questionCount`, `answerCount`, `reputation`, `createdAt`, `updatedAt`.
  - Accessible: Publicly readable (`allow read: if true;`).
  - Protected Fields: `reputation`, `isActive`, `uid`, `createdAt` cannot be modified by the user.

- **Private Vault (`/users/{uid}/private/info`):**
  - Fields: `email`, `defaultAnonymous`, `emailNotifications`, `pushNotifications`, `themePreference`.
  - Accessible: Strictly restricted to the authenticated document owner:
    ```firestore
    match /private/info {
      allow read, write: if isOwner(userId);
    }
    ```
  - Unauthenticated users and other members cannot query, read, or infer private user settings.

---

## 3. Mathematical Anonymous Privacy Isolation

To guarantee complete privacy when asking or answering questions:

1. **Public Document Sanitization:**
   - In `/questions/{questionId}` and `/answers/{answerId}`, when `isAnonymous: true`:
     - `authorUid` is omitted.
     - `authorUsername` is omitted.
     - `authorDisplayName` is hardcoded to `"Anonymous"`.
     - `authorPhotoUrl` is omitted.
   - Firestore security rules mandate this invariant:
     ```firestore
     (!incoming().isAnonymous
       ? incoming().authorUid == request.auth.uid
       : (!('authorUid' in incoming()) || incoming().authorUid == null) && incoming().authorDisplayName == 'Anonymous'
     )
     ```
2. **Private Ownership Record:**
   - Document created in `/questionOwners/{questionId}` and `/answerOwners/{answerId}`.
   - Holds `{ ownerUid: request.auth.uid, createdAt: ... }`.
   - Access control prevents public access:
     ```firestore
     allow read: if isSignedIn() && (existing().ownerUid == request.auth.uid || isAdmin());
     ```
   - Only the author and administrators can verify ownership.

---

## 4. Deterministic Key Architecture & Counter Protection

To prevent duplicate records, race-condition double-voting, or orphaned relationship tracking, OpenAsk enforces deterministic composite document IDs:

| Collection | ID Structure | Security Constraint Enforced |
|---|---|---|
| `/votes` | `{userId}_{answerId}` | `voteId == request.auth.uid + '_' + incoming().answerId && incoming().value in [1, -1]` |
| `/helpfulVotes` | `{userId}_{answerId}` | `helpfulId == request.auth.uid + '_' + incoming().answerId` |
| `/follows` | `{followerUid}_{targetUid}` | `followId == request.auth.uid + '_' + incoming().targetUid` |
| `/categoryFollows` | `{userId}_{categorySlug}` | `catFollowId == request.auth.uid + '_' + incoming().categorySlug` |
| `/questionFollows` | `{userId}_{questionId}` | `qFollowId == request.auth.uid + '_' + incoming().questionId` |
| `/savedItems` | `{userId}_{itemId}` | `savedId == request.auth.uid + '_' + incoming().itemId` |
| `/blocks` | `{userId}_{blockedUid}` | `blockId == request.auth.uid + '_' + incoming().blockedUid` |
| `/mutes` | `{userId}_{mutedUid}` | `muteId == request.auth.uid + '_' + incoming().mutedUid` |

---

## 5. Anti-Spoofing Notification Security

In a serverless architecture without paid Cloud Functions, client-initiated notifications must be strictly validated against forged events:

1. **Sender Integrity:** `incoming().senderUid == request.auth.uid`. A client cannot create a notification pretending to be from another user.
2. **Self-Notification Prevention:** `incoming().recipientUid != request.auth.uid`.
3. **State Integrity:** Must be created as `isRead == false`.
4. **Allowed Event Types:** Strictly restricted to `['answer', 'comment', 'helpful', 'vote', 'follow']`.
5. **Recipient Exclusivity:** Only the recipient can read, mark read, or delete the notification document.

---

## 6. Reputation Tamper Resistance

OpenAsk treats reputation as a **derived invariant** rather than a client-writable currency:

$$\text{Reputation} = \max\left(10,\, 10 + (\text{answerCount} \times 5) + (\text{questionCount} \times 2)\right)$$

- Any client request attempting to update `reputation` on `/users/{uid}` is rejected by Firestore security rules.
- Public display of reputation dynamically calculates the value based on verified contributions.

---

## 7. Category Protection & Static Fallback

- The `/categories` collection contains reference topics.
- Security rule:
  ```firestore
  match /categories/{categoryId} {
    allow read: if true;
    allow write: if isAdmin();
  }
  ```
- Normal users cannot alter categories, create arbitrary topics, or manipulate category counters.
- Client applications use `INITIAL_CATEGORIES` (50 validated categories) as a resilient local source of truth.
