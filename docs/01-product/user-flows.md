---
title: User Flows
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 01-product
related:
  - ./prd.md
  - ./functional-specifications.md
  - ../00-overview/product-vision.md
  - ../00-overview/success-metrics.md
  - ../02-design/ux-accessibility-motion.md
---

# User Flows

> **Purpose.** This document describes the key end-to-end journeys a user takes through WatchVerse, step by step. It shows how individual features ([PRD](./prd.md)) and behaviors ([Functional Specifications](./functional-specifications.md)) combine into coherent experiences.
>
> **Owns:** end-to-end journeys and their happy paths, alternate paths, and failure paths.
> **Does not own:** per-feature rules and states (see [Functional Specifications](./functional-specifications.md)) or requirements (see [PRD](./prd.md)).

Each flow lists the **goal**, the **happy path**, important **alternate/edge paths**, and the **success criteria** (linked to [Success Metrics](../00-overview/success-metrics.md)). Steps reference `PRD-*` requirements so journeys remain traceable.

---

## Flow 1 — First run (onboarding)
**Goal:** a brand-new user understands WatchVerse and has a non-empty, personalized start. (`ONB`)

**Happy path:**
1. User opens WatchVerse for the first time; the [app shell](../00-overview/glossary.md#a) loads instantly.
2. A brief intro (≤3 steps) explains what WatchVerse is and how to track titles (`PRD-ONB-1`).
3. The user is invited to seed a few favorites: they tap a handful of popular titles to mark Want-to-Watch or Completed (`PRD-ONB-2`).
4. The user optionally sets a display name (`PRD-ONB-3`).
5. The user lands on a Home that already feels personalized (recently added + early recommendations) (`HOME`).

**Alternate/edge paths:**
- **Skip:** the user skips at any step and still reaches a usable Home with graceful cold-start states (`PRD-ONB-4`, FS §3).
- **Offline first run:** intro works; the seed step shows a friendly offline message and is skippable (FS §2).

**Success criteria:** comprehension within ~30s ([M1](../00-overview/success-metrics.md)); first add within ~2 min ([M2](../00-overview/success-metrics.md)); start feels welcoming even with a tiny library (`PRD-PROF-6`).

---

## Flow 2 — Find a title and add it to the library
**Goal:** track a specific title with minimal friction. (`SRCH`, `LIB`)

**Happy path:**
1. From any screen, the user opens search (always accessible, `PRD-GLOB-1`).
2. They type; debounced autocomplete shows TMDB and in-library matches, recent searches when empty (`PRD-SRCH-3`, `HIST`).
3. They either act from results via a **quick action** (add / set status, `PRD-SRCH-9`) or open the title's detail page.
4. They add the title; the UI updates optimistically and a toast confirms (FS §1.2/§1.3).

**Alternate/edge paths:**
- **Refine:** apply genre/year filters and sorting; choices persist in the URL (`PRD-SRCH-4/5/6/8`).
- **No results:** a guiding empty state suggests adjusting filters (FS §4).
- **Offline:** search restricts to the local library with a clear notice (`PRD-SRCH-10`).
- **Already in library:** the result shows its **current watch status**, not merely an "in library" flag (`PRD-SYS-11`, [FS §1.8](./functional-specifications.md)).

**Success criteria:** add takes ≤2 interactions from a visible title ([M3](../00-overview/success-metrics.md)); search feels instant ([M7](../00-overview/success-metrics.md)).

---

## Flow 3 — Set status, rate, and review a movie
**Goal:** record an opinion and progress on a movie. (`DET`, `LIB`, `RATE`, `REV`)

**Happy path:**
1. The user opens a movie's detail page (`DET`).
2. They set status to **Completed**; watch date defaults to today (editable) (`PRD-LIB-6`).
3. They set a personal **rating** (0.5–10) via mouse, touch, or keyboard (`PRD-RATE-1/2`), with a brief satisfying animation (`PRD-RATE-3`).
4. They optionally write a **Review** (≤500 chars, live counter); it autosaves (`PRD-REV-1/2`, FS §8.2).
5. Changes feed statistics, activity, and possibly an achievement unlock (`STAT`, `ACT`, `ACH`).

**Alternate/edge paths:**
- **Rating a not-yet-added title:** rating/reviewing offers to add it automatically (FS §5/§8.1).
- **Clear rating / delete review:** supported; deletion is undoable (`PRD-RATE-4`, `PRD-REV-3`, FS §1.4).
- **Reduced motion:** rating/celebration animations are suppressed (FS §1.7).

**Success criteria:** rating effortless across input modes ([M4](../00-overview/success-metrics.md)); instant feedback ([M6](../00-overview/success-metrics.md)).

---

## Flow 4 — Track a TV show by season
**Goal:** know where the user is in a series and update progress. (`DET-TV`)

**Happy path:**
1. The user opens a show's detail page; seasons are listed with metadata (`PRD-DET-TV-1`).
2. They set the show's status to **Watching** and mark the **current season** (e.g. "watching S3") (`PRD-DET-TV-2/3`).
3. Later, they update progress to a new season, or mark the show **Completed** (`PRD-DET-TV-4`).
4. Completion updates statistics and may unlock an achievement.

**Alternate/edge paths:**
- **Spoiler protection on:** unwatched-season titles/overviews are blurred until revealed (`PRD-SET-9`, FS §6).
- **Ongoing/unknown seasons or specials:** render sensibly (FS §6 edge cases).
- **Offline:** if the show is in the library, progress can still be updated locally; new TMDB facts wait for connectivity (FS §1.5).

**Success criteria:** a user can answer "where am I in this show?" in one glance; updates persist reliably (`PRD-LIB-8`).

---

## Flow 5 — Organize with collections and tags
**Goal:** curate the library. (`COLL`, `TAG`)

**Happy path:**
1. From a title or a collections screen, the user creates a collection (e.g. "Date Night") (`PRD-COLL-1`).
2. They add titles to it; a title can join many collections (`PRD-COLL-2`).
3. They apply one or more tags to titles, creating tags on the fly as needed (`PRD-TAG-1/2`).
4. They later filter the library by tag or browse a collection's contents (`PRD-TAG-4`, `PRD-COLL-4`).

**Alternate/edge paths:**
- **Rename/delete:** collections/tags can be renamed or deleted; deletes are undoable and never remove the underlying titles (`PRD-COLL-3/5`, `PRD-TAG-3`, FS §1.4/§9).
- **Empty collection:** shows a guiding empty state (`PRD-COLL-6`).

**Success criteria:** organization feels lightweight; no accidental data loss (`PRD-SYS-5`).

---

## Flow 6 — "What should I watch?" (Cinema Mode)
**Goal:** decide quickly and enjoyably. (`CINE`)

**Happy path:**
1. From Home or the dashboard, the user launches Cinema Mode (`PRD-HOME-6`).
2. A premium full-screen reveal spins and settles on a random watchlist title (`PRD-CINE-1/2`).
3. The user re-rolls if desired (avoiding immediate repeats) (`PRD-CINE-3`).
4. They act on the pick — open details or mark it Watching (`PRD-CINE-4`).

**Alternate/edge paths:**
- **Empty watchlist:** a guiding state explains how to add titles, with a search entry point (`PRD-CINE-5`).
- **Reduced motion:** the reveal is instant, non-animated (FS §11).

**Success criteria:** the moment feels delightful and premium ([M16](../00-overview/success-metrics.md)); never a dead end.

---

## Flow 7 — Discover personalized recommendations
**Goal:** find something new grounded in the user's taste. (`REC`)

**Happy path:**
1. On Home, the user sees a "Recommended For You" rail (`PRD-HOME-4`).
2. Each item may show a reason ("Because you loved *Dune*") (`PRD-REC-2`).
3. The user opens or adds a recommended title.

**Alternate/edge paths:**
- **Cold start:** below the signal threshold, the rail shows trending/popular, labeled as such (`PRD-REC-3`, FS §10.3).
- **Offline:** last cached recommendations or graceful hide (`PRD-REC-6`).

**Success criteria:** recommendations feel relevant and transparent (never opaque/AI); computing them never janks Home (`PRD-REC-5`).

---

## Flow 8 — Review my watching life (dashboard & statistics)
**Goal:** reflect on habits and progress. (`PROF`, `STAT`, `ACH`, `ACT`)

**Happy path:**
1. The user opens their dashboard/profile (`PROF`).
2. They see statistics, Top 3 Movies/Shows, favorite genres, achievements, and recent activity (`PRD-PROF-2`).
3. They explore an achievement's progress or a statistic in more detail (`STAT`, `ACH`).

**Alternate/edge paths:**
- **Small library:** every module shows an encouraging low-data state (`PRD-PROF-6`, FS §10.1).
- **Offline:** the entire dashboard works from local data (`PRD-STAT-8`).

**Success criteria:** insight feels rewarding and accurate at any library size; works offline.

---

## Flow 9 — Back up and restore (import/export)
**Goal:** protect and move the library. (`DATA`) — central to ["Your Data Is Sacred"](../00-overview/product-principles.md).

**Happy path (export):**
1. In Settings → Data management, the user exports (`PRD-SET-11`, `PRD-DATA-1`).
2. A single versioned JSON file downloads with a timestamped name.

**Happy path (import/restore):**
1. The user chooses a previously exported file.
2. WatchVerse validates it and offers **Merge** (default; combines with the current library) or **Replace Existing Library** (secondary; overwrites current data), each clearly explained and requiring explicit confirmation (`PRD-DATA-2/3`, FS §12.2).
3. On confirm, data is migrated/applied; achievements re-evaluate against the imported library (FS §13.2).

**Alternate/edge paths:**
- **Invalid/corrupt file:** rejected with a clear message; existing data untouched (`PRD-DATA-4`).
- **Version mismatch:** older exports are migrated forward (`PRD-DATA-5`).

**Success criteria:** export→import round-trips faithfully; no data loss caused by the app ([M15](../00-overview/success-metrics.md)).

---

## Flow 10 — Adjust preferences
**Goal:** tailor the experience. (`SET`)

**Happy path:**
1. The user opens Settings.
2. They change a preference (e.g. default view, reduced motion, spoiler protection); it applies immediately and persists (`PRD-SET-12`, FS §12.1).

**Alternate/edge paths:**
- **Theme:** only Cinema Dark is selectable in v1.0; the control is present and future-ready (`PRD-SET-5`).
- **Reduced motion:** defaults to the OS setting, with manual override (`PRD-SET-4`).

**Success criteria:** preferences are respected everywhere immediately ([M14](../00-overview/success-metrics.md)).

---

## Flow 11 — Using WatchVerse offline / installed as a PWA
**Goal:** rely on the app without a connection. (`SYS`, PWA)

**Happy path:**
1. The user installs WatchVerse to their device (PWA, `PRD-SYS-3`).
2. Offline, they open the app; the cached app shell loads instantly.
3. They browse and edit their full local library, view stats/achievements, and manage collections/tags/reviews (`PRD-SYS-4`, FS §1.5).
4. Online-only areas (TMDB search/discovery) show calm offline states until connectivity returns.

**Alternate/edge paths:**
- **Reconnect:** TMDB-backed areas refresh automatically when back online.
- **Quota pressure:** if storage is constrained, the app degrades gracefully and never corrupts data (FS §1.3/§1.6).

**Success criteria:** the app feels reliable offline; no generic error screens ([M11](../00-overview/success-metrics.md)).

---

## Cross-flow guarantees
Across every flow above, the following always hold (per [Functional Specifications §1](./functional-specifications.md)):
- Visible feedback within ~100 ms ([M6](../00-overview/success-metrics.md)).
- All four states handled (loading/empty/error/offline) ([M11](../00-overview/success-metrics.md)).
- Destructive actions confirmable/undoable; no app-caused data loss ([M15](../00-overview/success-metrics.md)).
- Full keyboard operability and reduced-motion respect ([M13](../00-overview/success-metrics.md), [M14](../00-overview/success-metrics.md)).
- One clear primary action per screen ([M5](../00-overview/success-metrics.md)).
- Any title already in the library shows its current watch status wherever it appears (`PRD-SYS-11`, [FS §1.8](./functional-specifications.md)).

---

### Related documents
- [PRD](./prd.md) — the requirements these journeys realize
- [Functional Specifications](./functional-specifications.md) — the detailed behavior each step relies on
- [Success Metrics](../00-overview/success-metrics.md) — the targets these flows are measured against
- [UX, Accessibility & Motion](../02-design/ux-accessibility-motion.md) — interaction and motion rules underpinning these flows
