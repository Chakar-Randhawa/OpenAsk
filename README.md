# OpenAsk — Global Social Knowledge & Discussion Platform

OpenAsk is an intentional, production-grade web platform for global inquiry, discussion, and knowledge exchange. Built for desktop, tablet, and mobile viewports, OpenAsk allows users to ask questions, contribute answers, follow subjects and members, cast verified votes, bookmark discussions, and post with guaranteed mathematical anonymity.

---

## 1. Architectural Highlights

- **Web-First Responsive Architecture**: Designed fluidly for 320px mobile through 2560px ultrawide displays with bounded reading measures, zero horizontal scroll, and zero layout shift.
- **Original OpenAsk Design System**: Calm typography (Syne display + Plus Jakarta Sans body), zero-pill metadata discipline, hairline structural borders, and single-elevation cards.
- **Real Firebase Backend**:
  - **Firebase Authentication**: Email/password and Google Sign-In with popup.
  - **Cloud Firestore**: Real documents, real counters, collections, composite indexes, and strict ABAC rules.
  - **Mathematical Privacy Guarantee**: Anonymous questions and answers never store author identifiers in public documents. Private ownership is decoupled into `/questionOwners` and `/answerOwners` protected by Firestore rules.
- **50 Core Categories**: Real, structured knowledge categories seeded directly in Firestore.
- **Abuse Prevention**: Client & rule-enforced character boundaries, deterministic single-vote records (`${userId}_${answerId}`), and reporting architecture.

---

## 2. Directory Structure

```
├── firebase-applet-config.json     # Provisioned Firebase client configuration
├── firebase-blueprint.json         # Master data model schema & collection specifications
├── firestore.rules                 # Hardened Firestore security rules (ABAC + PII isolation)
├── firestore.indexes.json          # Composite query indexes
├── security_spec.md                # Security invariants and attack vectors
├── src/
│   ├── assets/images/              # High-fidelity photography assets
│   ├── components/
│   │   ├── answer/                 # Answer card, voting controls, helpful badges
│   │   ├── dialogs/                # Report modal, Share modal
│   │   ├── layout/                 # Navbar, Sidebar, ContextSidebar, BottomNav, Footer
│   │   └── question/               # Question card, metadata row
│   ├── core/
│   │   ├── constants/              # 50 initial categories seed, asset maps
│   │   ├── context/                # AuthContext (Auth & user profile), ThemeContext (Light/Dark/System)
│   │   ├── firebase/               # Firebase app, db, auth initialization & typed error handlers
│   │   ├── models/                 # TypeScript interfaces (Question, Answer, UserProfile, Category, etc.)
│   │   └── services/               # Question, Answer, User, Category, Notification, Search, Report services
│   ├── pages/                      # Landing, Home, Discover, Category, QuestionDetail, Profile, Ask, etc.
│   ├── App.tsx                     # React Router routes and provider hierarchy
│   ├── index.css                   # Tailwind v4 base styles, typography tokens, custom scrollbars
│   └── main.tsx                    # Entry point
└── test/
    └── openask.test.ts             # Invariant test suite
```

---

## 3. Core Capabilities & Workflows

### Asking & Answering
- Users can post questions with title, body context, category, tags, and an optional **Anonymous** switch.
- When posting anonymously, `authorUid`, `authorUsername`, and `authorDisplayName` are stripped from the public question/answer document. Only an isolated `/questionOwners/{questionId}` document records ownership.
- Contributors can submit answers with real-time vote updates and helpful markings.

### Feed & Exploration
- **For You**: Chronological discovery feed across active discussions.
- **Trending**: Deterministically ranked by views, answer volume, and freshness.
- **New**: Chronological stream of newest inquiries.
- **Following**: Feed filtered to contributors the user follows.

### Categories
- 50 full categories across Science, Technology, Philosophy, Business, Politics, Art, and Lifestyle.
- Users can follow topics to receive contextual updates.

### Bookmarks & Notifications
- Save useful questions for quick reference in `/saved`.
- Real-time notification center tracking answers, votes, and follows in `/notifications`.

---

## 4. Development & Testing Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Run TypeScript lint verification
npm run lint

# Run invariant tests
npm test

# Build for production
npm run build
```

---

## 5. Security & Free-Tier Invariants

- **No paid infrastructure**: Fully compatible with Firebase free tier (Spark plan).
- **No external paid search engine**: Search utilizes repository pattern over Firestore with client-side indexing.
- **Zero Mock Data**: If no questions or answers exist in Firestore, authentic empty states are displayed inviting the user to start a discussion.
