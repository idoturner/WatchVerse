---
title: Product Requirements Document (PRD)
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 01-product
related:
  - ./functional-specifications.md
  - ./user-flows.md
  - ../00-overview/product-vision.md
  - ../00-overview/product-principles.md
  - ../00-overview/anti-goals.md
  - ../00-overview/glossary.md
  - ../03-architecture/data-models.md
  - ../05-delivery/development-roadmap.md
---

# Product Requirements Document (PRD)

> **Purpose.** This document is the product source of truth for WatchVerse Version 1.0. It defines *what* the product does, from the user's perspective: the complete feature catalog, what is in and out of scope, the priority of each requirement, and how features map to delivery phases.
>
> **Owns:** features and requirements (the "what"), scope, and prioritization.
> **Does not own:** detailed behavior, states, and edge cases (see [Functional Specifications](./functional-specifications.md)); end-to-end journeys (see [User Flows](./user-flows.md)); visual design ([Design System](../02-design/design-system.md)); data shapes ([Data Models](../03-architecture/data-models.md)); or technical architecture ([Architecture Overview](../03-architecture/architecture-overview.md)).

This document assumes no prior knowledge of WatchVerse. Terms in **bold-with-no-link** on first use are defined in the [Glossary](../00-overview/glossary.md).

---

## 1. How to read this document

### 1.1 Requirement IDs
Every requirement has a stable identifier of the form `PRD-<AREA>-<n>` (e.g. `PRD-LIB-3`). These IDs are referenced by the [Functional Specifications](./functional-specifications.md), [User Flows](./user-flows.md), and [Testing Strategy](../04-engineering/testing-strategy.md). **IDs are permanent**: if a requirement is removed, its ID is retired, never reused.

Area codes: `ONB` onboarding · `HOME` home/discovery · `SRCH` search · `DET` title details · `LIB` library & status · `RATE` rating · `REV` review · `COLL` collections · `TAG` tags · `STAT` statistics · `ACH` achievements · `ACT` activity timeline · `PROF` profile/dashboard · `REC` recommendations · `CINE` Cinema Mode · `HIST` search history · `SET` settings · `DATA` import/export · `GLOB` global search · `SYS` cross-cutting/system.

### 1.2 Priority (MoSCoW)
- **Must** — required for Version 1.0 to be considered complete.
- **Should** — important; included in v1.0 unless it endangers the ship line.
- **Could** — desirable; included only if it fits without compromising quality.
- **Won't (v1.0)** — explicitly deferred; listed in §3.3 and the [Roadmap](../05-delivery/development-roadmap.md), **not** an [anti-goal](../00-overview/anti-goals.md).

### 1.3 Phase
Each feature area notes its primary delivery **Phase** (1–10), per the [Development Roadmap](../05-delivery/development-roadmap.md). The hard ship line is **end of Phase 3**: a usable, beautiful tracking product.

### 1.4 Acceptance
Each requirement's detailed acceptance behavior (states, edge cases, validation) lives in the correspondingly-referenced section of [Functional Specifications](./functional-specifications.md). This PRD states the requirement; the functional spec states exactly how it must behave.

---

## 2. Product summary

WatchVerse is a premium, [local-first](../00-overview/glossary.md#l) application for tracking every movie and TV show a user has watched, is watching, or wants to watch. Catalog data comes from [TMDB](../00-overview/glossary.md#t); all user data lives on the user's device. The product is single-user, private, poster-first, and delivered as an installable [PWA](../00-overview/glossary.md#p). For the full vision and audience, see [Product Vision](../00-overview/product-vision.md).

Every requirement below is subordinate to the nine-plus-one [Product Principles](../00-overview/product-principles.md) and the [Anti-Goals](../00-overview/anti-goals.md). Where a requirement could be read as conflicting with those, this PRD resolves it explicitly.

---

## 3. Scope

### 3.1 In scope (Version 1.0)
Onboarding/first-run; Home & discovery; search for movies and TV with filters and sorting; movie and TV detail pages; the personal library with five watch statuses; ratings; reviews; season-level TV tracking; collections; tags; statistics; achievements; activity timeline; profile/dashboard; rules-based "Recommended For You"; Cinema Mode (random picker); search history; settings/preferences; JSON import/export; global search access; PWA installability and offline support for the local library.

### 3.2 Decisions & challenges to the original brief
As Lead Architect I am flagging where this PRD intentionally diverges from the original feature list, with reasoning, per our standing agreement to challenge assumptions:

- **"Notes" and "Reviews" merged** into a single **Review** concept (optional, plain text, ≤500 chars). Rationale: two near-identical free-text fields would confuse users and duplicate data. Approved.
- **"Random Movie Picker" and "Cinema Mode" merged** into one feature (`CINE`): one engine, one premium presentation. Rationale: they were one feature wearing two hats.
- **Per-episode TV tracking deferred**; v1.0 tracks at the **season** level. Rationale: data-volume and UI cost vastly outweigh the marginal benefit for an MVP; the data model keeps episode-level tracking addable later. (Recorded as an ADR.)
- **"Continue exploring" cut from v1.0.** Rationale: it was undefined and overlapped with trending/popular and Recommended For You. It may return later only with a concrete definition. Listed under §3.3.
- **Language filter deferred** (`SRCH`): genre + year + sort cover the overwhelming majority of intent at far lower UI cost. Language remains a stored TMDB preference (`SET`), just not a search filter in v1.0.
- **Command palette deferred** to the polish phase, per your decision; global search is still reachable everywhere via the search bar (`GLOB`).
- **Import/Export added** to v1.0 (Phase 3) as a data-safety necessity ("Your Data Is Sacred").
- **Onboarding/first-run added** to v1.0 to solve cold-start for Home, stats, and recommendations.

### 3.3 Deferred (Won't, v1.0 — planned, not anti-goals)
Per-episode tracking; command palette; additional themes (Midnight Blue, OLED Black); cloud sync & accounts; "Continue exploring" (pending definition); language search filter; external observability/analytics. See [Roadmap](../05-delivery/development-roadmap.md).

### 3.4 Out of scope (by principle — permanent)
Anything in [Anti-Goals](../00-overview/anti-goals.md): social networking, followers, comments, chat, ads, attention-harvesting notifications, streaming/piracy, mandatory accounts, opaque AI recommendations.

---

## 4. Feature requirements

> Notation: each table row is **[ID] — requirement — Priority**. Detailed behavior is in [Functional Specifications](./functional-specifications.md) (§ referenced per area).

### 4.1 Onboarding & First-Run (`ONB`) — Phase 9 (designed for from Phase 1)
The first-run experience must make WatchVerse understandable within ~30 seconds ([M1](../00-overview/success-metrics.md)) and seed enough signal to avoid an empty Home, stats, and recommendations.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-ONB-1 | On first launch, present a brief, skippable introduction (max 3 steps) explaining what WatchVerse is and how to add titles. | Should |
| PRD-ONB-2 | Offer an optional "seed your library" step where the user can quickly mark a handful of popular titles as watched/want-to-watch to personalize Home and stats. | Should |
| PRD-ONB-3 | Let the user set their display name during onboarding (editable later in `PROF`/`SET`). | Could |
| PRD-ONB-4 | Onboarding must never block access to the app; the user can skip at any point and reach a usable Home. | Must |
| PRD-ONB-5 | First-run state must be recorded locally so onboarding does not repeat on subsequent launches. | Must |

### 4.2 Home & Discovery (`HOME`) — Phase 5
The landing experience. Must look intentional and beautiful even with **zero** user data (cold start).

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-HOME-1 | Display a Home screen composed of horizontally scrollable, poster-led content rails. | Must |
| PRD-HOME-2 | Provide rails for: Trending (movies), Trending (TV), Popular (movies), Popular (TV), Upcoming (movies), Popular Anime, and Recently Released. | Must |
| PRD-HOME-3 | Provide a "Recently Added by You" rail sourced from the user's library; hidden or replaced gracefully when empty. | Must |
| PRD-HOME-4 | Provide a "Recommended For You" rail (`REC`) that becomes personalized as the library grows and falls back to trending/popular before there is enough signal. | Should |
| PRD-HOME-5 | Provide an always-accessible entry point to global search (`GLOB`) from Home. | Must |
| PRD-HOME-6 | Provide a prominent entry point to Cinema Mode / random picker (`CINE`). | Should |
| PRD-HOME-7 | Provide quick actions on rail items (e.g. add to library, set status) without leaving Home. | Should |
| PRD-HOME-8 | Each rail must handle loading (skeleton), empty, error, and offline states gracefully; rails dependent on TMDB degrade without breaking the page. | Must |
| PRD-HOME-9 | Tapping any title opens its detail page (`DET`) via a smooth transition. | Must |

### 4.3 Search — Movies & TV (`SRCH`) — Phase 2
A single search experience parameterized by media type; movies and TV behave identically except where noted.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-SRCH-1 | Allow searching TMDB for movies and TV shows by free text. | Must |
| PRD-SRCH-2 | Simultaneously search the user's local library and present local matches distinctly. | Must |
| PRD-SRCH-3 | Provide autocomplete/suggestions as the user types, debounced so the input remains responsive regardless of network latency ([M7](../00-overview/success-metrics.md)). | Must |
| PRD-SRCH-4 | Provide a genre filter. | Must |
| PRD-SRCH-5 | Provide a release-year (or year-range) filter. | Should |
| PRD-SRCH-6 | Provide sorting: A–Z, Z–A, Newest, Oldest, Date Added (library), Rating. | Must |
| PRD-SRCH-7 | Provide a grid/list view toggle. | Should |
| PRD-SRCH-8 | Persist the user's filter, sort, and view choices in the URL so results are shareable/restorable within the session. | Should |
| PRD-SRCH-9 | Provide hover/press affordances and quick actions on result items. | Should |
| PRD-SRCH-10 | Handle no-results, loading, error, and offline states gracefully; offline restricts to local-library search with a clear message. | Must |
| PRD-SRCH-11 | (Deferred) Language filter. | Won't (v1.0) |

### 4.4 Title Details — Movies (`DET`) — Phase 2
The canonical page for a single title, combining TMDB facts with the user's personal data.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-DET-1 | Display backdrop, poster, title, overview, genres, runtime, and release date. | Must |
| PRD-DET-2 | Display principal cast and the director(s). | Must |
| PRD-DET-3 | Display the TMDB rating (clearly distinct from the user's personal rating). | Must |
| PRD-DET-4 | Provide an embedded or linked trailer when available. | Should |
| PRD-DET-5 | Display a "Similar titles" section. | Should |
| PRD-DET-6 | Allow the user to add/remove the title from their library and set its watch status (`LIB`). | Must |
| PRD-DET-7 | Allow the user to set a personal rating (`RATE`), write a review (`REV`), record a watch date, and increment rewatch count. | Must |
| PRD-DET-8 | Allow the user to assign the title to collections (`COLL`) and tags (`TAG`). | Must |
| PRD-DET-9 | Provide quick actions for the most common operations (add, set status, rate). | Should |
| PRD-DET-10 | Handle loading, error, and offline states; if the title is already in the library, its detail (user data) must be viewable offline even when TMDB facts cannot refresh. | Must |

### 4.5 Title Details — TV Shows (`DET-TV`) — Phase 4
Everything in `DET` (4.4) applies, plus season-level tracking.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-DET-TV-1 | Display the show's seasons with per-season metadata (e.g. season number, episode count, air dates). | Must |
| PRD-DET-TV-2 | Allow the user to mark a current season and indicate season-level progress (e.g. "watching season 3"). | Must |
| PRD-DET-TV-3 | Allow per-show watch status (Watching / Completed / On Hold / Dropped / Want to Watch) consistent with `LIB`. | Must |
| PRD-DET-TV-4 | Allow marking the whole show as completed and reflect completion in statistics. | Must |
| PRD-DET-TV-5 | The TV data model must be designed so per-episode tracking can be added later without breaking existing season-level data. | Must |

### 4.6 Library & Watch Status (`LIB`) — Phase 3
The user's personal collection of tracked titles — the heart of the product.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-LIB-1 | Allow adding any movie or TV title to the library. | Must |
| PRD-LIB-2 | Support the five watch statuses: Want to Watch, Watching, Completed, On Hold, Dropped. | Must |
| PRD-LIB-3 | Allow changing a title's status at any time, with immediate visual feedback. | Must |
| PRD-LIB-4 | Allow removing a title from the library, with confirmation and/or undo (data-safety). | Must |
| PRD-LIB-5 | Provide a Library screen listing tracked titles with filter (by status, media type, genre), sort (`SRCH-6` set), and grid/list toggle. | Must |
| PRD-LIB-6 | Setting a title to "Completed" should sensibly default the watch date (editable). | Should |
| PRD-LIB-7 | Track rewatch count per title. | Should |
| PRD-LIB-8 | Every library mutation must be persisted durably and reflected across the app immediately. | Must |
| PRD-LIB-9 | The Library screen must remain smooth with 1,000+ titles ([M9](../00-overview/success-metrics.md)). | Must |
| PRD-LIB-10 | The full library must be browsable offline. | Must |

### 4.7 Rating (`RATE`) — Phase 3

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-RATE-1 | Provide a 10-point personal rating supporting 0.5 increments. | Must |
| PRD-RATE-2 | The rating control must be operable by mouse, touch, and keyboard ([M4](../00-overview/success-metrics.md)). | Must |
| PRD-RATE-3 | Provide a satisfying, purposeful animation on rating, respecting reduced-motion. | Should |
| PRD-RATE-4 | Allow clearing a previously set rating. | Should |
| PRD-RATE-5 | Personal ratings feed statistics, top lists, and certain achievements. | Must |

### 4.8 Review (`REV`) — Phase 3

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-REV-1 | Allow an optional, private, plain-text **Review** per title, maximum 500 characters. | Must |
| PRD-REV-2 | Show a live character count and prevent exceeding the limit. | Should |
| PRD-REV-3 | Allow editing and deleting a review. | Must |
| PRD-REV-4 | Reviews are local and never shared (per [Anti-Goals](../00-overview/anti-goals.md)). | Must |

### 4.9 Collections (`COLL`) — Phase 6

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-COLL-1 | Allow creating unlimited custom collections with a name (e.g. "Marvel", "Date Night"). | Must |
| PRD-COLL-2 | Allow adding/removing titles to/from any collection; a title may belong to many collections. | Must |
| PRD-COLL-3 | Allow renaming and deleting collections, with confirmation/undo on delete. | Must |
| PRD-COLL-4 | Provide a view of a collection's contents with sort and grid/list. | Should |
| PRD-COLL-5 | Collections store references to titles, not copies (data integrity). | Must |
| PRD-COLL-6 | Handle the empty-collection state with a guiding empty state. | Must |

### 4.10 Tags (`TAG`) — Phase 6

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-TAG-1 | Allow creating unlimited custom tags. | Must |
| PRD-TAG-2 | Allow applying/removing multiple tags to/from any title (many-to-many). | Must |
| PRD-TAG-3 | Allow renaming and deleting tags, with confirmation/undo on delete. | Should |
| PRD-TAG-4 | Allow filtering the library by tag. | Should |

### 4.11 Statistics (`STAT`) — Phase 7
Derived insights, computed from the library; never the source of truth.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-STAT-1 | Show counts of movies watched and shows watched. | Must |
| PRD-STAT-2 | Show average personal rating. | Must |
| PRD-STAT-3 | Show favorite/most-watched genres. | Must |
| PRD-STAT-4 | Show estimated total watch hours. | Should |
| PRD-STAT-5 | Show watchlist size, collection count, and completion percentage. | Should |
| PRD-STAT-6 | Present key statistics with clear, accessible charts/visualizations. | Should |
| PRD-STAT-7 | Statistics must compute correctly and performantly with 1,000+ titles. | Must |
| PRD-STAT-8 | All statistics must be available offline (computed from local data). | Must |
| PRD-STAT-9 | Count only fully Completed shows as "Shows Watched"; report shows currently in progress as a separate "Watching" statistic. | Must |

### 4.12 Achievements (`ACH`) — Phase 8
A single-player, declarative reward system. Never competitive or social.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-ACH-1 | Provide achievements for milestones: movies watched, shows watched, genre milestones, rewatch milestones, decade milestones, and completion milestones. | Should |
| PRD-ACH-2 | Achievements must be defined declaratively (as data/config), not hardcoded per achievement. | Must |
| PRD-ACH-3 | Evaluate achievements automatically after relevant user actions and unlock them when criteria are met. | Should |
| PRD-ACH-4 | Present a visually rewarding unlock celebration, respecting reduced-motion. | Should |
| PRD-ACH-5 | Provide a view of unlocked and locked achievements with progress toward locked ones. | Could |
| PRD-ACH-6 | Achievement evaluation must work offline from local data. | Should |

### 4.13 Activity Timeline (`ACT`) — Phase 8

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-ACT-1 | Record user activity events: added a title, changed status/finished a show, rated a title, wrote/updated a review, created a collection, unlocked an achievement. | Should |
| PRD-ACT-2 | Display a reverse-chronological timeline of recent activity. | Should |
| PRD-ACT-3 | The activity log must be capped (bounded storage) to protect the storage budget. | Must |
| PRD-ACT-4 | Activity is local and private. | Must |

### 4.14 Profile & Dashboard (`PROF`) — Phase 7

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-PROF-1 | Provide an editable profile display name. | Must |
| PRD-PROF-2 | Present a dashboard aggregating statistics (`STAT`), Top 3 Movies, Top 3 Shows, favorite genres, achievements (`ACH`), and recent activity (`ACT`). | Should |
| PRD-PROF-3 | Surface recently watched and recently added titles. | Should |
| PRD-PROF-4 | Surface the user's collections and reviews entry points. | Should |
| PRD-PROF-5 | Provide a random recommendation entry point (links to `REC`/`CINE`). | Could |
| PRD-PROF-6 | The dashboard must be useful and welcoming with a small library, not only a large one (per "Welcoming at any size"). | Must |

### 4.15 Recommended For You (`REC`) — Phase 5
Transparent, rules-based, derived from the user's own library. Not AI (per [Anti-Goals](../00-overview/anti-goals.md)).

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-REC-1 | Generate recommendations from the user's library signals: favorite genres, highly rated titles, favorite directors, recently completed shows, and TMDB similar/recommended results. | Should |
| PRD-REC-2 | Each recommendation should carry a human-readable reason (e.g. "Because you loved *Dune*"). | Could |
| PRD-REC-3 | Before sufficient signal exists, gracefully fall back to trending/popular content. | Must |
| PRD-REC-4 | Recommendations must be deduplicated against titles already in the library where appropriate. | Should |
| PRD-REC-5 | Recommendation computation must be efficient with large libraries and must not block the UI. | Must |
| PRD-REC-6 | If offline, show the last available recommendations or degrade gracefully. | Should |

### 4.16 Cinema Mode / Random Picker (`CINE`) — Phase 5

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-CINE-1 | Provide a random picker that selects a title from the user's watchlist (Want to Watch). | Should |
| PRD-CINE-2 | Present the pick through a premium, full-screen "Cinema Mode" reveal animation, respecting reduced-motion. | Should |
| PRD-CINE-3 | Allow the user to re-roll for another pick. | Should |
| PRD-CINE-4 | Allow acting on the pick (open details, mark watching) directly from Cinema Mode. | Should |
| PRD-CINE-5 | Handle the empty-watchlist case with a guiding message and a path to add titles. | Must |

### 4.17 Search History (`HIST`) — Phase 5

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-HIST-1 | Record recent searches locally (capped list). | Should |
| PRD-HIST-2 | Show recent searches when the search interface opens with no query. | Should |
| PRD-HIST-3 | Allow clearing all history and removing individual entries. | Should |
| PRD-HIST-4 | Search history is local-only and never transmitted. | Must |

### 4.18 Settings & Preferences (`SET`) — Phase 9 (store from Phase 1)
Device-level preferences, stored separately from library data.

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-SET-1 | Preferred default view (grid/list). | Should |
| PRD-SET-2 | Preferred default sort. | Should |
| PRD-SET-3 | Preferred poster size/density. | Could |
| PRD-SET-4 | Reduced-motion toggle, defaulting to the OS preference with manual override. | Must |
| PRD-SET-5 | Theme selection (Cinema Dark only in v1.0; architecture future-ready for more). | Should |
| PRD-SET-6 | Default landing page. | Could |
| PRD-SET-7 | Confirm-before-delete toggle (default on). | Should |
| PRD-SET-8 | Trailer/backdrop autoplay toggle. | Could |
| PRD-SET-9 | Spoiler protection toggle (blur unwatched-season titles/overviews). | Could |
| PRD-SET-10 | Content language/region preference (default en-US), used for TMDB requests. | Should |
| PRD-SET-11 | Data management: access to import/export (`DATA`) and a clear-all-data action with strong confirmation. | Must |
| PRD-SET-12 | Settings persist locally and apply immediately. | Must |

### 4.19 Import / Export (`DATA`) — Phase 3
Local backup/restore; also the rehearsal for future cloud sync. Central to "Your Data Is Sacred."

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-DATA-1 | Export all user data (library, collections, tags, reviews, profile, settings, activity, achievements, search history) to a single versioned JSON file. | Must |
| PRD-DATA-2 | Import a previously exported JSON file, validating and migrating it as needed. | Must |
| PRD-DATA-3 | On import, offer two clearly-explained modes — **Merge** (default; combines the file with the current library) and **Replace Existing Library** (secondary; overwrites current data) — each requiring explicit confirmation before any data changes. | Must |
| PRD-DATA-4 | Reject invalid/corrupt files gracefully without damaging existing data. | Must |
| PRD-DATA-5 | The export format must be versioned to support forward migration. | Must |

### 4.20 Global Search Access (`GLOB`) — Phase 2

| ID | Requirement | Priority |
| --- | --- | --- |
| PRD-GLOB-1 | Global search (TMDB + local) must be reachable from every screen. | Must |
| PRD-GLOB-2 | Search input must remain responsive regardless of network latency, presenting results with appropriate loading affordances ([M7](../00-overview/success-metrics.md)). | Must |
| PRD-GLOB-3 | Search must be fully keyboard-operable and accessible. | Must |
| PRD-GLOB-4 | (Deferred) A ⌘K/Ctrl-K command palette as an accelerated entry point. | Won't (v1.0) |

### 4.21 Cross-Cutting / System (`SYS`)
Requirements that apply across all features. Detailed behavior in [Functional Specifications](./functional-specifications.md); technical detail in [Architecture](../03-architecture/architecture-overview.md).

| ID | Requirement | Priority | Phase |
| --- | --- | --- | --- |
| PRD-SYS-1 | Every data-driven view must implement the four-state contract: loading, empty, error, offline — never a raw error screen. | Must | All |
| PRD-SYS-2 | Every user action must produce visible feedback within ~100 ms ([M6](../00-overview/success-metrics.md)). | Must | All |
| PRD-SYS-3 | The app must be installable as a PWA with an offline-capable app shell. | Must | 1, 9 |
| PRD-SYS-4 | The full local library and all derived views (stats, achievements) must function offline. | Must | 3+ |
| PRD-SYS-5 | Destructive actions must be confirmable and/or undoable (data-safety). | Must | 3+ |
| PRD-SYS-6 | The app must meet WCAG 2.1 AA (keyboard, focus, ARIA, contrast). | Must | All |
| PRD-SYS-7 | The app must remain smooth with 1,000+ tracked titles. | Must | 3+ |
| PRD-SYS-8 | TMDB attribution must be displayed as required by TMDB's terms. | Must | 2 |
| PRD-SYS-9 | The app must not require an account or network connection to use the local library. | Must | All |
| PRD-SYS-10 | Reduced-motion preferences must be honored across all animations. | Must | All |
| PRD-SYS-11 | Any title already in the user's library must clearly display its current watch status (Want to Watch, Watching, Completed, On Hold, Dropped) wherever it appears — search results, discovery rails, recommendations, similar-title rails, Cinema Mode, and any other TMDB-powered listing — preventing duplicate actions and reinforcing that WatchVerse always knows the user's relationship with every title. This is an app-wide UX rule, not a per-screen behavior. | Must | All |

---

## 5. Prioritization summary & phase mapping

| Phase | Primary feature areas | Ship significance |
| --- | --- | --- |
| 1 | Foundation, design tokens + core kit, data backbone, settings store, PWA shell (`SYS`, `SET` store) | Internal |
| 2 | `SRCH`, `DET` (movies), `GLOB`, TMDB attribution | Browsable product |
| 3 | `LIB`, `RATE`, `REV`, `DATA`, undo/confirm (`SYS-5`) | **Ship line — usable tracker** |
| 4 | `DET-TV` (season-level) | TV-capable |
| 5 | `HOME`, `REC`, `CINE`, `HIST` | Landing experience |
| 6 | `COLL`, `TAG` | Organization |
| 7 | `PROF`, `STAT` | Insight |
| 8 | `ACH`, `ACT` | Reward & history |
| 9 | `ONB`, full `SET` UI, command palette (deferred), a11y/perf/offline hardening | Polish |
| 10 | Backend readiness (optional) | Future |

The detailed, authoritative phase plan lives in the [Development Roadmap](../05-delivery/development-roadmap.md); if the two ever disagree, the roadmap owns sequencing and this table is updated to match.

---

## 6. Assumptions
- **A1.** TMDB provides all required catalog data (movies, TV, anime as a genre/category of either, images, cast, director via credits, trailers via videos, ratings, similar/recommendations). Validated against TMDB's API in [TMDB Integration](../03-architecture/tmdb-integration.md).
- **A2. Decided (see §7 Q1):** WatchVerse has exactly two media types — **Movie** and **TV Show**. "Anime" is **not** a media type; it is a discovery category sourced via a curated TMDB Discover query (the exact query finalized in [TMDB Integration](../03-architecture/tmdb-integration.md)). This keeps the data model simple while keeping the rail flexible.
- **A3.** A single user per device/browser profile; no multi-user accounts in v1.0.
- **A4.** "Watched/completed" semantics: a movie is "watched" when set to Completed; a show is "watched/completed" when marked completed at the show level.

## 7. Resolved decisions (formerly open questions)
These were open during drafting and have now been **decided** by the product owner. They are binding for v1.0; any future change requires an [ADR](../03-architecture/decisions/).

- **Q1 — Anime → RESOLVED.** Exactly two media types (Movie, TV Show). "Popular Anime" is a curated TMDB Discover query, **not** a media type (see A2; query finalized in [TMDB Integration](../03-architecture/tmdb-integration.md)).
- **Q2 — Import semantics → RESOLVED.** Default = **Merge**; secondary = **Replace Existing Library**. Both clearly explain their effect and require explicit confirmation (`PRD-DATA-3`; [Functional Specifications §12.2](./functional-specifications.md)). Rationale: Merge is the safer, data-preserving default; Replace remains available for backup restoration but requires a deliberate choice.
- **Q3 — "Shows Watched" → RESOLVED.** Counts only fully **Completed** shows; in-progress shows are reported as a separate "Watching" statistic (`PRD-STAT-1`, `PRD-STAT-9`; [Functional Specifications §10.1](./functional-specifications.md)).
- **Q4 — Watch Hours → RESOLVED.** Estimated watch hours **include rewatches**, representing total viewing time rather than unique titles watched (`PRD-STAT-4`; [Functional Specifications §10.1](./functional-specifications.md)).

No open questions remain for this folder.

---

### Related documents
- [Functional Specifications](./functional-specifications.md) — exact behavior, states, and edge cases for every requirement here
- [User Flows](./user-flows.md) — the end-to-end journeys these features compose into
- [Product Vision](../00-overview/product-vision.md) · [Product Principles](../00-overview/product-principles.md) · [Anti-Goals](../00-overview/anti-goals.md) — the "why" and the boundaries
- [Data Models](../03-architecture/data-models.md) — the shapes behind these features
- [Development Roadmap](../05-delivery/development-roadmap.md) — authoritative sequencing
