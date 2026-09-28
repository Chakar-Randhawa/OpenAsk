# OpenAsk — Responsive UI & Layout Audit

**Document:** `docs/RESPONSIVE_UI_AUDIT.md`  
**Target Viewport Matrix:** 320px to 2560px  
**Architecture:** 100% Responsive Web Application (No Mobile App Shell)  

---

## 1. Responsive Philosophy & Grid Breakdown

OpenAsk is architected around a fluid, adaptive responsive grid that scales smoothly from small smartphones to ultrawide cinema monitors without horizontal page scrolling, broken component boundaries, or artificial letterboxing.

```
Width Range        Layout Strategy                  Navigation Pattern
-----------------------------------------------------------------------------
320px - 479px      Single column, full width        Slide-over drawer + clean bottom bar
480px - 767px      Single column, padded containers Slide-over drawer + clean bottom bar
768px - 1023px     Adaptive two-column or collapsed Top horizontal navigation
1024px - 1279px    Two-column (Nav + Content)       Left vertical sidebar + Top nav
1280px - 1535px    Three-column (Nav + Main + Aside)Left sidebar + Context sidebar
1536px - 2560px    Centered 1280px container        Balanced editorial layout
```

---

## 2. Viewport-by-Viewport Verification

### 1. 320px (Small Smartphone - e.g. iPhone SE 1st gen)
- **Status:** PASS
- **Navigation:** Top wordmark "OpenAsk" scales to `text-xl`. Mobile menu hamburger button (`p-2`) allows full drawer navigation. Search form collapses to dedicated search page link.
- **Card Layout:** Question and Answer cards render with `p-4`, typography scales down cleanly (`text-base` headers), metadata wraps into two clean lines with typographical separators (`·`).
- **Horizontal Overflow:** `overflow-x-hidden` on root container guarantees zero horizontal scroll.
- **Form Inputs:** Form fields on `/ask`, `/settings`, and `/login` use `w-full` with flexible padding.

### 2. 360px (Standard Android Phone - e.g. Galaxy S8)
- **Status:** PASS
- **Cards:** Action rows cleanly separate answer count, view count, bookmark toggle, and share button.
- **Tags:** Tag list wraps with `flex-wrap gap-2` without overflowing card borders.

### 3. 375px (Compact iPhone - e.g. iPhone X / 12 mini)
- **Status:** PASS
- **Category Grid:** `/discover` displays 1 column with full-width cards; descriptions truncate cleanly (`line-clamp-2`).
- **Modals:** `ConfirmModal`, `ReportModal`, and `ShareModal` render with `max-w-sm` and `p-4` viewport inset margins.

### 4. 390px (Modern iPhone - e.g. iPhone 13/14/15)
- **Status:** PASS
- **Typography:** Standard `text-base` titles with `text-sm` body preview provide high editorial legibility.
- **Answer Composer:** Textarea adjusts naturally with no clipped text.

### 5. 414px (Phablet / Plus Size Phone - e.g. iPhone 11 Pro Max)
- **Status:** PASS
- **Header:** Ample horizontal room for wordmark, theme button, and quick-ask CTA.
- **Feeds:** Card list maintains comfortable whitespace.

### 6. 480px (Large Phone / Landscape Handheld)
- **Status:** PASS
- **Category Grid:** Transitions smoothly toward 2-column layout on slightly wider screens.
- **Dialogs:** Centered backdrop with soft blur and keyboard accessibility.

### 7. 600px (Small Tablet / Foldable Phone Inner Display)
- **Status:** PASS
- **Navigation:** Header quick-search bar begins expanding.
- **Cards:** Metadata row displays on a single line (`Category · Author · Timestamp`).

### 8. 768px (Standard Tablet Portrait - e.g. iPad Mini / Air)
- **Status:** PASS
- **Top Navigation:** Full text links (`Feed`, `Discover`, `Topics`, `Guidelines`) display directly in top navigation.
- **Bottom Navigation:** Bottom bar automatically hides (`md:hidden`), leaving full vertical screen real estate for content.
- **Sidebar:** Left sidebar collapses gracefully until full desktop width is reached.

### 9. 820px (iPad 10th Gen)
- **Status:** PASS
- **Layout:** Main content area expands comfortably (`max-w-3xl mx-auto`).
- **Question Detail Page:** Answer composer, question title, and author details format with generous padding.

### 10. 1024px (Tablet Landscape / Small Laptop - iPad Pro 12.9)
- **Status:** PASS
- **Sidebar Emerges:** Left desktop sidebar (`w-56 shrink-0 lg:block`) appears, offering fast direct navigation to Feed, Discover, All Topics, Following, and Bookmarks.
- **Two-Column Balance:** Left sidebar takes 224px, main content takes remaining width without crowding.

### 11. 1280px (Standard Desktop / Laptop - 13" MacBook)
- **Status:** PASS
- **Three-Column Layout:** Contextual right sidebar (`w-72 shrink-0 xl:block`) activates:
  - Displays Anonymous Posting Guarantee card.
  - Displays Suggested Topics to explore.
  - Displays mini editorial footer.
- **Reading Width:** Main feed remains bounded to ~680px, the optimal typographic measure (65-75 characters per line) for long-form reading.

### 12. 1440px (Modern Desktop / 15-16" Laptop)
- **Status:** PASS
- **Composition:** Perfectly balanced 3-column editorial presentation. No stretching or awkward whitespace gaps.
- **Hover & Focus:** Subtle neutral hover transitions (`hover:border-neutral-300 dark:hover:border-neutral-700`).

### 13. 1920px (Full HD Monitor)
- **Status:** PASS
- **Max Width Bounding:** Container is locked to `max-w-7xl mx-auto px-8` (1280px max inner width).
- **Ultrawide Balance:** Layout remains elegantly centered with balanced neutral margins. No stretched text or distorted cards.

### 14. 2560px (QHD / 4K / Ultrawide Monitors)
- **Status:** PASS
- **Zero Distortions:** The application preserves visual equilibrium. Navigation, cards, and aside panels do not float apart or collapse.

---

## 3. Component Responsive Hardening Details

1. **`Navbar`**:
   - `md:hidden` mobile menu drawer for screens <768px.
   - Truncated search input that expands on focus.
   - Theme toggle available consistently on all screen widths.

2. **`MainLayout`**:
   - `overflow-x-hidden` prevents horizontal sliding.
   - Responsive bottom padding (`pb-20 md:pb-12`) prevents bottom bar overlap on mobile.

3. **`QuestionCard` & `AnswerCard`**:
   - `line-clamp-2` on card previews prevents massive card vertical heights on mobile.
   - Action controls wrap cleanly if user votes or comments expand.

4. **`DiscoverPage`**:
   - Responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`) adjusts automatically from 1 to 3 columns.
