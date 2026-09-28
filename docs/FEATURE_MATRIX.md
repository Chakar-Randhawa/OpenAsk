# OpenAsk — Production Feature Matrix

**Document:** `docs/FEATURE_MATRIX.md`  
**Status Levels:**
- **IMPLEMENTED:** Verified end-to-end with real Firestore persistence and UI integration.
- **PARTIALLY IMPLEMENTED:** Functional with minor interface or edge constraints.
- **MISSING:** Not present in repository.
- **BLOCKED:** Dependent on prohibited paid services or third-party infrastructure.
- **TEST ONLY:** Present only in unit or invariant test files.

---

## Feature Matrix

| Feature | Status | Verification & Evidence | Notes / Constraints |
|---|---|---|---|
| **Email/Password Signup** | **IMPLEMENTED** | `AuthContext.tsx`, `AuthPage.tsx` | Validates display name & username regex |
| **Email/Password Login** | **IMPLEMENTED** | `AuthContext.tsx`, `AuthPage.tsx` | Error states & session persistence |
| **Google Sign-In** | **IMPLEMENTED** | `AuthContext.tsx`, `AuthPage.tsx` | Uses Firebase `signInWithPopup` |
| **Password Reset** | **IMPLEMENTED** | `AuthContext.tsx`, `AuthPage.tsx` | Native Firebase email dispatch |
| **Sign Out** | **IMPLEMENTED** | `AuthContext.tsx`, `Navbar.tsx` | Clears credentials & active state |
| **Public User Profile** | **IMPLEMENTED** | `UserProfilePage.tsx`, `/users/{uid}` | Display name, username, bio, stats |
| **Private User Settings** | **IMPLEMENTED** | `SettingsPage.tsx`, `/users/{uid}/private` | Email, theme, anonymity preference |
| **50 Curated Categories** | **IMPLEMENTED** | `initialCategories.ts`, `DiscoverPage.tsx` | Categorized across 50 knowledge domains |
| **Category Follow / Unfollow** | **IMPLEMENTED** | `categoryService.ts`, `CategoryPage.tsx` | Real Firestore `/categoryFollows` |
| **Ask Question (Public)** | **IMPLEMENTED** | `AskPage.tsx`, `questionService.ts` | Title, body, tags, category selector |
| **Ask Question (Anonymous)** | **IMPLEMENTED** | `AskPage.tsx`, `questionService.ts` | Omits UID; private `/questionOwners` |
| **Question Deletion** | **IMPLEMENTED** | `QuestionDetailPage.tsx`, `ConfirmModal.tsx` | Owner-verified atomic deletion |
| **Answer Submission (Public)**| **IMPLEMENTED** | `QuestionDetailPage.tsx`, `answerService.ts`| Updates question answerCount |
| **Answer Submission (Anon)** | **IMPLEMENTED** | `QuestionDetailPage.tsx`, `answerService.ts`| Omits UID; private `/answerOwners` |
| **Answer Deletion** | **IMPLEMENTED** | `QuestionDetailPage.tsx`, `ConfirmModal.tsx` | Cascades count decrement |
| **Deterministic Voting** | **IMPLEMENTED** | `AnswerCard.tsx`, `answerService.ts` | Upvote/downvote (+1/-1), one per user |
| **Helpful Answer Endorse** | **IMPLEMENTED** | `AnswerCard.tsx`, `answerService.ts` | Toggle mark on `/helpfulVotes` |
| **Derived Reputation** | **IMPLEMENTED** | `UserProfilePage.tsx`, `openask.test.ts` | Formula: 10 + (answers*5) + (questions*2) |
| **Threaded Comments** | **IMPLEMENTED** | `AnswerCard.tsx`, `commentService.ts` | Supports public & anonymous comments |
| **Question Bookmarking** | **IMPLEMENTED** | `QuestionCard.tsx`, `SavedPage.tsx` | Private `/savedItems` collection |
| **User-to-User Follow** | **IMPLEMENTED** | `UserProfilePage.tsx`, `userService.ts` | Real Firestore `/follows` composite key |
| **In-App Notifications** | **IMPLEMENTED** | `NotificationsPage.tsx`, `notificationService.ts` | Filter unread, mark read, deep link |
| **Abuse Reporting** | **IMPLEMENTED** | `ReportModal.tsx`, `reportService.ts` | Saves to `/reports`, admin-only read |
| **Share Link Modal** | **IMPLEMENTED** | `ShareModal.tsx` | Copies canonical URL to clipboard |
| **Multi-Entity Search** | **IMPLEMENTED** | `SearchPage.tsx`, `searchService.ts` | Real search across questions, topics, members |
| **Theme Switching (L/D/S)** | **IMPLEMENTED** | `ThemeContext.tsx`, `Navbar.tsx` | Light, Dark, System; persists in localStorage |
| **Responsive Web Layout** | **IMPLEMENTED** | `MainLayout.tsx`, Tailwind v4 | Tested from 320px to 2560px |
| **Modal Dialog System** | **IMPLEMENTED** | `ConfirmModal.tsx`, `ReportModal.tsx` | In-app modal replacements for browser alert |
| **Community Guidelines** | **IMPLEMENTED** | `LegalPage.tsx` | Rules, reputation, and anonymous privacy |
| **Terms of Service** | **IMPLEMENTED** | `LegalPage.tsx` | Formal product terms |
| **Privacy Policy** | **IMPLEMENTED** | `LegalPage.tsx` | Clear data retention & isolation terms |
| **Blaze / Paid Search API** | **BLOCKED** | N/A | Prohibited by Free Tier requirement |
| **Server-Side Background Tasks**| **BLOCKED** | N/A | Prohibited (requires paid Cloud Functions) |
