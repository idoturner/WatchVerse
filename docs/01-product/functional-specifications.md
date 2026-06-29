---
title: Functional Specifications
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 01-product
related:
  - ./prd.md
  - ./user-flows.md
  - ../00-overview/success-metrics.md
  - ../00-overview/glossary.md
  - ../02-design/ux-accessibility-motion.md
  - ../03-architecture/state-and-persistence.md
  - ../03-architecture/pwa-and-offline.md
  - ../03-architecture/data-models.md
---

# Functional Specifications

> **Purpose.** This document specifies *how* WatchVerse behaves. For each feature and screen it defines the states, rules, validation, and edge cases that the [PRD](./prd.md) requirements must satisfy. It is the bridge between *what* the product does (PRD) and *how it is built* ([Architecture](../03-architecture/architecture-overview.md)).
>
> **Owns:** functional behavior, state handling, validation rules, and edge cases.
> **Does not own:** the requirements themselves (see [PRD](./prd.md)); end-to-end journeys ([User Flows](./user-flows.md)); visual styling ([Design System](../02-design/design-system.md)); or data shapes ([Data Models](../03-architecture/data-models.md)).

Behavior here is written to be testable. Each section references the `PRD-*` requirement IDs it specifies, so the [Testing Strategy](../04-engineering/testing-strategy.md) can trace requirement → behavior → test.

---

## 1. Cross-cutting behavior (applies everywhere)

These rules apply to **every** screen and override nothing below them; feature sections specify only their deviations.

### 1.1 The Four-State Contract (specifies `PRD-SYS-1`)
Every view that depends on data must explicitly handle four states. A blank screen or a raw browser/error message is never acceptable.

| State | When | Behavior |
| --- | --- | --- |
| **Loading** | Data is being fetched or computed | Show a **skeleton** that mirrors the final layout (not a spinner where a skeleton is possible). Input that does not depend on the data remains usable. |
| **Empty** | The request succeeded but there is no content (e.g. empty library, no search results, empty collection) | Show a purposeful **empty state**: illustration/icon, a short headline, a one-line explanation, and a clear primary action that moves the user forward. |
| **Error** | The request failed (TMDB error, unexpected failure) | Show a friendly, recoverable error: plain-language message, a **Retry** action, and (where relevant) a fallback to any cached/local data. Never expose stack traces or raw codes. |
| **Offline** | The action requires the network and the device is offline | Show a calm offline notice scoped to the affected area; keep all local-data functionality fully available. Offline is a *specific, friendly* variant of empty/error, never a hard failure. |
| **Loaded** | Data is present | Render content. |

**Rule:** a screen is not "done" until all applicable states are implemented and verified (see [M11](../00-overview/success-metrics.md)).

### 1.2 Feedback & responsiveness (specifies `PRD-SYS-2`)
- Every user action produces visible feedback within ~100 ms: hover/press states, optimistic updates, toasts, or a skeleton.
- Long-running or network operations show progress affordances immediately; input is never silently blocked.

### 1.3 Optimistic updates & persistence (specifies `PRD-SYS-2`, `PRD-LIB-8`)
- Mutations to **local user data** (add to library, set status, rate, review, tag, collection changes) apply **optimistically**: the UI updates immediately, then the [Repository](../00-overview/glossary.md#r) persists.
- Because storage is local and synchronous-or-fast, persistence is expected to succeed; if a write fails (e.g. quota exceeded), the app rolls back the optimistic change, preserves the user's input, and surfaces a recoverable error (see §1.6).
- Writes are **debounced/batched** for high-frequency inputs (e.g. typing a review) to avoid thrashing storage (see [State & Persistence](../03-architecture/state-and-persistence.md)).

### 1.4 Destructive actions: confirm & undo (specifies `PRD-SYS-5`, `PRD-LIB-4`, `PRD-COLL-3`, `PRD-TAG-3`)
Destructive actions are: removing a title from the library, deleting a collection, deleting a tag, deleting a review, clearing search history, importing with "replace", and clear-all-data.
- **Undo-first pattern (preferred):** perform the action immediately (optimistic), show a toast with an **Undo** affordance for a short window (~5–7s); on undo, fully restore the prior state.
- **Confirm pattern:** for high-severity, hard-to-undo actions (clear-all-data, import-replace), require an explicit confirmation dialog instead of/in addition to undo.
- The **Confirm-before-delete** setting (`PRD-SET-7`, default on) governs whether item-level deletes also require a confirmation dialog; undo is always available regardless.
- No destructive action may result in unrecoverable loss caused by the app itself ([M15](../00-overview/success-metrics.md)).

### 1.5 Offline behavior matrix (specifies `PRD-SYS-4`, `PRD-SYS-9`)
| Capability | Online | Offline |
| --- | --- | --- |
| Browse/search local library | ✅ | ✅ |
| View details of a title already in the library (user data + cached facts) | ✅ | ✅ |
| Statistics, achievements, activity, collections, tags, reviews, ratings | ✅ | ✅ |
| Import/Export | ✅ | ✅ |
| Settings | ✅ | ✅ |
| TMDB search / discovery rails / similar / trailers / new title facts | ✅ | ⛔ (friendly offline state; local search still offered) |
| Recommended For You | ✅ | ⚠️ last cached result or graceful hide |

Connectivity is exposed app-wide via a status signal; online-only affordances are disabled with a short explanation rather than failing on click. Full mechanics in [PWA & Offline](../03-architecture/pwa-and-offline.md).

### 1.6 Validation & data integrity (specifies `PRD-DATA-4`, `PRD-SYS-5`)
- All external input — TMDB responses and any data read from storage or import files — is validated before use ([Zod](../00-overview/glossary.md#z)).
- Invalid stored data is quarantined and surfaced as a recoverable state; it never crashes the app or silently corrupts good data.
- Schema-versioned data is migrated on read; see [State & Persistence](../03-architecture/state-and-persistence.md).

### 1.7 Accessibility (specifies `PRD-SYS-6`, `PRD-SYS-10`)
- All interactive elements are keyboard-reachable and operable, with visible focus.
- Semantic structure, correct ARIA, and AA contrast are required.
- Non-essential motion is suppressed when reduced-motion is set. Full rules in [UX, Accessibility & Motion](../02-design/ux-accessibility-motion.md).

### 1.8 Library status visibility (specifies `PRD-SYS-11`)
Wherever a title appears anywhere in the app — search results, discovery rails, recommendations, similar-title rails, Cinema Mode, collection views, and any other [TMDB](../00-overview/glossary.md#t)-powered listing — if that title is in the user's library, its current [watch status](../00-overview/glossary.md#w) is clearly indicated (e.g. a status badge on the poster). This is a single, consistent, app-wide rule, **not** a per-screen behavior.

Its purpose is twofold: prevent duplicate or redundant actions (the user never re-adds something they already track), and reinforce that WatchVerse always knows the user's relationship with every title. Titles **not** in the library present an add affordance instead. The status indicator updates immediately when status changes (optimistic, §1.3), so the same title shows a consistent status everywhere at once. The visual treatment of the status indicator is defined in the [Design System](../02-design/design-system.md); this rule governs only *that it must always be present and accurate*.

---

## 2. Onboarding & First-Run (`ONB`)

- **Trigger:** first launch with no prior first-run record (`PRD-ONB-5`).
- **Flow:** up to three skippable steps (intro → optional seed → optional name). Skipping at any step lands the user on a usable Home (`PRD-ONB-4`).
- **Seed step (`PRD-ONB-2`):** presents a small set of popular titles; selecting marks them Want-to-Watch or Completed with one tap. Selections create real [LibraryEntries](../00-overview/glossary.md#l).
- **Empty seed:** if the user seeds nothing, Home/stats/recommendations must still render their cold-start states gracefully (§3, §10).
- **Completion:** sets the first-run record so onboarding does not recur; re-runnable later only via a Settings action (optional, `Could`).
- **Edge cases:** offline on first launch → intro still works; the seed step degrades to a friendly offline message (it needs TMDB) and can be skipped.

---

## 3. Home & Discovery (`HOME`)

- **Composition:** vertically stacked, horizontally scrollable poster rails (`PRD-HOME-1/2`).
- **Cold start (critical):** with an empty library, "Recently Added by You" (`PRD-HOME-3`) is hidden or replaced by an inviting prompt; "Recommended For You" (`PRD-HOME-4`) falls back to trending/popular (`PRD-REC-3`). The page must look intentional and full, never broken (see [M1](../00-overview/success-metrics.md)).
- **Per-rail states:** each rail independently shows loading (skeleton row), empty, error (with retry, scoped to that rail), or offline. One failing rail must never break the page (`PRD-HOME-8`).
- **Quick actions (`PRD-HOME-7`):** hover (pointer) / long-press or explicit affordance (touch) reveals add-to-library and set-status without navigation; actions are optimistic (§1.3).
- **Library status on rails (`PRD-SYS-11`):** any rail item already in the library shows its current watch status (§1.8); items not tracked show an add affordance.
- **Navigation:** selecting a title opens its detail page with a smooth, interruptible transition (`PRD-HOME-9`, §1.2).
- **Entry points:** global search (`PRD-HOME-5`) and Cinema Mode (`PRD-HOME-6`) are always visible.
- **Offline:** TMDB rails show offline state; "Recently Added by You" and any local rails remain functional.

---

## 4. Search — Movies & TV (`SRCH`, `GLOB`)

- **Input:** debounced free-text (≈250–300 ms) so input is never blocked and requests are de-duplicated/cancelled ([M7](../00-overview/success-metrics.md)).
- **Dual results (`PRD-SRCH-2`):** local-library matches are computed instantly and shown distinctly (e.g. a "In your library" group) alongside TMDB results.
- **Autocomplete (`PRD-SRCH-3`):** shows suggestions and, when the field is empty, recent searches (`HIST`, §9).
- **Filters:** genre (`PRD-SRCH-4`) and year/year-range (`PRD-SRCH-5`); sort (`PRD-SRCH-6`) across A–Z, Z–A, Newest, Oldest, Date Added (library context only), Rating. View toggle grid/list (`PRD-SRCH-7`).
- **State in URL (`PRD-SRCH-8`):** query, filters, sort, and view persist in the URL within the session.
- **States:** typing (loading skeleton results), no-results (empty state with suggestions to adjust filters), error (retry), offline (restrict to local search with a clear notice) (`PRD-SRCH-10`).
- **Edge cases:** empty query shows recent searches + suggested/trending entry points, not an error; rapid typing cancels stale requests; a title already in the library shows its **current watch status** (§1.8, `PRD-SYS-11`), not merely an "in library" flag.
- **Keyboard:** full keyboard operation of field, suggestions, filters, and results (`PRD-GLOB-3`).

---

## 5. Title Details — Movies (`DET`)

- **Data composition:** the page merges TMDB facts (backdrop, poster, overview, genres, runtime, release date, cast, director, TMDB rating, trailer, similar) with the user's [LibraryEntry](../00-overview/glossary.md#l) (status, rating, review, watch date, rewatch count, collections, tags).
- **TMDB vs. personal rating (`PRD-DET-3`):** the two ratings are always visually and semantically distinct; never conflated.
- **Primary action:** the dominant action is add-to-library / set-status (`PRD-DET-6`), satisfying "one clear primary action" ([M5](../00-overview/success-metrics.md)).
- **Personal data editing (`PRD-DET-7/8`):** rating, review, watch date, rewatch count, collections, and tags are editable inline; all changes are optimistic and persisted (§1.3).
- **Not-in-library state:** personal-data controls are presented as a clear call to add; rating/reviewing offers to add the title automatically (see Q in [PRD §3.2]/flows).
- **Trailer (`PRD-DET-4`):** shown when available; absent gracefully when not.
- **Similar (`PRD-DET-5`):** a rail; handles its own four states; items already in the library show their watch status (§1.8).
- **Offline (`PRD-DET-10`):** if the title is in the library, user data + last-cached facts render; non-cached TMDB sections (e.g. similar, trailer) show offline state. A title not in the library and not cached shows a friendly offline message.

---

## 6. Title Details — TV Shows (`DET-TV`)

All of §5 applies, plus:
- **Seasons (`PRD-DET-TV-1`):** list seasons with number, episode count, and air dates from TMDB.
- **Season progress (`PRD-DET-TV-2`):** the user can mark a **current season** and indicate season-level progress (e.g. "watching S3"); v1.0 does **not** track individual episodes.
- **Status & completion (`PRD-DET-TV-3/4`):** show-level watch status mirrors `LIB`; marking the show Completed sets completion and feeds stats.
- **Spoiler protection (`PRD-SET-9`, if enabled):** titles/overviews for unwatched seasons are blurred until revealed.
- **Forward-compatibility (`PRD-DET-TV-5`):** the season model is structured so a future per-episode layer attaches beneath seasons without altering existing season records (see [Data Models](../03-architecture/data-models.md)).
- **Edge cases:** shows with unknown/zero seasons, ongoing shows with future seasons, and specials (season 0) must render sensibly.

---

## 7. Library & Watch Status (`LIB`)

- **Add/remove (`PRD-LIB-1/4`):** adding creates a LibraryEntry with a default status (Want to Watch unless context implies otherwise, e.g. rating implies Completed — see flows). Removing follows the undo/confirm pattern (§1.4).
- **Statuses (`PRD-LIB-2/3`):** the five statuses are mutually exclusive; changing status gives immediate feedback and logs activity (`ACT`).
- **Completed defaults (`PRD-LIB-6`):** setting Completed defaults watch date to today, editable.
- **Rewatch (`PRD-LIB-7`):** incrementable; influences stats per [PRD Q4].
- **Library screen (`PRD-LIB-5`):** filter by status/media type/genre/tag; sort per `SRCH-6`; grid/list toggle; each combination reflects in URL where practical.
- **Performance (`PRD-LIB-9`):** lists exceeding ~100 items are virtualized; state subscriptions are selector-based to avoid re-render storms with 1,000+ titles.
- **Offline (`PRD-LIB-10`):** entire library browsable and mutable offline.
- **Empty state:** a first-time empty library shows an inviting prompt to search and add the first title.

---

## 8. Rating (`RATE`) & Review (`REV`)

### 8.1 Rating
- **Scale (`PRD-RATE-1`):** 0.5–10.0 in 0.5 steps; internally a half-star control.
- **Input (`PRD-RATE-2`):** mouse (click/drag), touch (tap/drag), keyboard (arrow keys adjust by 0.5; Home/End to min/max). Visible focus and an accessible value label.
- **Animation (`PRD-RATE-3`):** purposeful fill animation; suppressed under reduced-motion.
- **Clear (`PRD-RATE-4`):** an explicit way to remove a rating returns the title to unrated.
- **Effect:** rating an un-added title prompts/auto-adds it to the library (per flows) and feeds stats (`PRD-RATE-5`).

### 8.2 Review
- **Constraints (`PRD-REV-1/2`):** optional, plain text, ≤500 characters with a live counter; input is hard-capped at 500.
- **Edit/delete (`PRD-REV-3`):** editing autosaves (debounced, §1.3); deletion follows undo (§1.4).
- **Privacy (`PRD-REV-4`):** never shared or transmitted.
- **Edge cases:** whitespace-only review is treated as empty; emoji/Unicode counts by user-perceived characters where feasible.

---

## 9. Collections (`COLL`), Tags (`TAG`), Search History (`HIST`)

### 9.1 Collections
- **Create/rename/delete (`PRD-COLL-1/3`):** names are required, trimmed, and must be non-empty; duplicate names are allowed but a gentle warning is shown. Delete follows undo/confirm (§1.4).
- **Membership (`PRD-COLL-2/5`):** many-to-many via references; removing a title from a collection never deletes the title.
- **Collection view (`PRD-COLL-4`):** sortable, grid/list, with its own empty state (`PRD-COLL-6`).

### 9.2 Tags
- **Create/apply (`PRD-TAG-1/2`):** tags are short labels; applying is many-to-many; creating-on-the-fly while tagging is supported.
- **Rename/delete (`PRD-TAG-3`):** delete removes the tag from all titles (undo available).
- **Filter (`PRD-TAG-4`):** library filterable by one or more tags.

### 9.3 Search History
- **Capture (`PRD-HIST-1`):** committed searches are stored, deduplicated, most-recent-first, capped (~10–15).
- **Surface (`PRD-HIST-2`):** shown when search opens empty.
- **Clear (`PRD-HIST-3`):** clear-all (undo) and per-entry removal.
- **Privacy (`PRD-HIST-4`):** local-only.

---

## 10. Statistics (`STAT`), Profile/Dashboard (`PROF`), Recommendations (`REC`)

### 10.1 Statistics
- **Computation (`PRD-STAT-1–5`):** pure functions over the library; recomputed when underlying data changes, memoized to stay performant at 1,000+ titles (`PRD-STAT-7`).
- **Definitions (final, per [PRD §7](./prd.md)):** "Shows Watched" counts only fully **Completed** shows; shows in progress are reported separately as a "Watching" figure (`PRD-STAT-9`). **Estimated watch hours include rewatches** (`PRD-STAT-4`), representing the user's total viewing time rather than unique titles watched. Each stat's exact formula is documented alongside its implementation.
- **Charts (`PRD-STAT-6`):** accessible (labels, non-color-only encoding, keyboard-reachable legends).
- **Offline (`PRD-STAT-8`):** fully available from local data.
- **Cold start:** with little data, stats show encouraging zero/low states, never broken charts (supports "Welcoming at any size", `PRD-PROF-6`).

### 10.2 Profile / Dashboard
- **Editable name (`PRD-PROF-1`):** inline edit, validated non-empty, persisted.
- **Aggregation (`PRD-PROF-2/3/4`):** composes `STAT`, Top 3 Movies/Shows (by personal rating, tie-broken sensibly), favorite genres, achievements, recent activity, recently watched/added, collections/reviews entry points.
- **Small-library behavior (`PRD-PROF-6`):** every dashboard module has a graceful low-data state.

### 10.3 Recommended For You
- **Inputs/scoring (`PRD-REC-1`):** deterministic, rules-based scoring over favorite genres, highly rated titles, favorite directors, recently completed shows, plus TMDB similar/recommended.
- **Reasons (`PRD-REC-2`):** each item may carry a human-readable reason.
- **Cold start (`PRD-REC-3`):** below a signal threshold (e.g. <5 rated/completed), fall back to trending/popular and label accordingly.
- **Dedup (`PRD-REC-4`):** exclude already-tracked titles where appropriate; any tracked title that is shown still displays its watch status (§1.8).
- **Performance (`PRD-REC-5`):** computed lazily (on Home mount), capped candidate set, memoized; never blocks the UI.
- **Offline (`PRD-REC-6`):** last cached result or graceful hide.

---

## 11. Cinema Mode / Random Picker (`CINE`)

- **Selection (`PRD-CINE-1`):** uniformly random from the Want-to-Watch list (watchlist).
- **Presentation (`PRD-CINE-2`):** a premium, full-screen reveal ("spin" → settle → reveal). Under reduced-motion, the reveal is instant and non-animated.
- **Re-roll (`PRD-CINE-3`):** picks again; should avoid immediately repeating the previous pick when more than one candidate exists.
- **Act on pick (`PRD-CINE-4`):** open details or set status (e.g. Watching) directly.
- **Empty watchlist (`PRD-CINE-5`):** a guiding state explaining how to add titles, with a search entry point — never a dead end.

---

## 12. Settings (`SET`) & Import/Export (`DATA`)

### 12.1 Settings
- **Apply immediately (`PRD-SET-12`):** changes take effect without reload and persist locally, in a namespace separate from the library.
- **Reduced motion (`PRD-SET-4`):** defaults to OS preference; manual override persists.
- **Theme (`PRD-SET-5`):** only Cinema Dark selectable in v1.0; the control is present and future-ready.
- **Spoiler protection (`PRD-SET-9`):** toggles blurring of unwatched-season content (§6).
- **Data management (`PRD-SET-11`):** entry points to import/export and clear-all-data (strong confirmation, §1.4).

### 12.2 Import / Export
- **Export (`PRD-DATA-1/5`):** serializes all user namespaces to one versioned JSON file with a timestamped filename.
- **Import (`PRD-DATA-2/3`):** validates and migrates, then offers two clearly-explained modes, each requiring explicit confirmation before any change:
  - **Merge (default):** combines the imported file with the current library. On a per-record conflict (same title/entity present in both), the **most recently updated** record wins, using each entity's `updatedAt` timestamp (see [Data Models](../03-architecture/data-models.md)). Merge is the default because it is the safer, data-preserving choice.
  - **Replace Existing Library (secondary):** overwrites all current user data with the file's contents. Reserved for backup restoration; requires a more deliberate confirmation than Merge.
- **Failure handling (`PRD-DATA-4`):** invalid/corrupt files are rejected with a clear message and **no** mutation of existing data.
- **Round-trip guarantee:** export → import on a fresh profile reproduces the user's library faithfully (a tested invariant — see [Testing Strategy](../04-engineering/testing-strategy.md)).

---

## 13. Activity Timeline (`ACT`) & Achievements (`ACH`)

### 13.1 Activity
- **Events (`PRD-ACT-1`):** add title, status change/finish show, rate, write/update review, create collection, unlock achievement.
- **Display (`PRD-ACT-2`):** reverse-chronological; each event human-readable with timestamp.
- **Cap (`PRD-ACT-3`):** bounded ring buffer (e.g. last 500); oldest events drop first.
- **Privacy (`PRD-ACT-4`):** local-only.

### 13.2 Achievements
- **Declarative (`PRD-ACH-2`):** each achievement is a config object (id, title, description, icon, and a rule evaluated against stats).
- **Evaluation (`PRD-ACH-3`):** runs after relevant actions; idempotent (re-evaluation never re-unlocks or double-counts).
- **Celebration (`PRD-ACH-4`):** a rewarding unlock animation; reduced-motion shows a non-animated confirmation.
- **Browse (`PRD-ACH-5`):** unlocked + locked with progress.
- **Offline (`PRD-ACH-6`):** evaluable from local data.
- **Edge cases:** importing data re-evaluates achievements against the imported library; already-unlocked achievements remain unlocked.

---

## 14. Traceability
Every `PRD-*` requirement is specified by at least one section above. The [Testing Strategy](../04-engineering/testing-strategy.md) will map these sections to concrete tests, and [User Flows](./user-flows.md) shows how they combine into journeys. PRD open questions Q1–Q4 are now **resolved** (see [PRD §7](./prd.md)); their behavior is final in this document (§10.1 and §12.2). Any future change to a resolved decision requires an [ADR](../03-architecture/decisions/).

---

### Related documents
- [PRD](./prd.md) — the requirements this document specifies
- [User Flows](./user-flows.md) — these behaviors composed into journeys
- [UX, Accessibility & Motion](../02-design/ux-accessibility-motion.md) — the cross-cutting interaction/a11y/motion rules referenced throughout
- [State & Persistence](../03-architecture/state-and-persistence.md) · [PWA & Offline](../03-architecture/pwa-and-offline.md) — the mechanics behind optimistic updates and offline behavior
- [Success Metrics](../00-overview/success-metrics.md) — the measurable targets this behavior must meet
