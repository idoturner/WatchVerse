---
title: Changelog
status: Living
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 05-delivery
related:
  - ./development-roadmap.md
  - ./progress-checklist.md
  - ../03-architecture/decisions/README.md
---

# Changelog

> **Purpose.** The human-readable historical record of WatchVerse — what was decided, approved, revised, or shipped, and when. It is the project's memory.
>
> **Owns:** the chronological record of changes (documentation, decisions, and — once building begins — releases).
> **Does not own:** current status ([Progress Checklist](./progress-checklist.md)); the plan ([Development Roadmap](./development-roadmap.md)); decision reasoning ([ADRs](../03-architecture/decisions/README.md)).

Format follows [Keep a Changelog](https://keepachangelog.com) conventions, adapted: during the documentation phase, entries track **documentation** and **decisions**; once code begins, **release** sections (with versions) are added. Tracked revisions to approved documents are recorded here for traceability.

---

## [Unreleased]

**Versioning:** WatchVerse follows **Semantic Versioning** — `v0.1.0` (Phases 1–3, ship line), `v0.2.0` (Phase 4), `v0.3.0` (Phase 5), `v0.4.0` (Phase 6), `v0.5.0` (Phase 7), `v0.6.0` (Phase 8), `v1.0.0` (Phase 9, first stable release), `v1.0.1` (post-release TMDB data-quality patch), `v1.0.2` (Cinema Mode polish). Phase 10 (optional backend/cloud) would follow only if separately approved. See [Development Roadmap → Versioning](./development-roadmap.md#3-phase-summary--versioning).

## [1.0.2] — 2026-06-29 — Cinema Mode polish 🎬

A focused post-`v1.0.0` polish patch for Cinema Mode (not a new phase, not Phase 10). Health gate green (typecheck / lint / 229 tests / build).

**Premium reveal**
- **Poster-roulette reveal animation**: spinning briefly rolls through ~8 eligible posters (ease-out, ~1s) before the pick settles with a subtle gold glow/scale. No confetti, no sound, no canvas/particles, **no new dependency** (Framer Motion only). The Spin control is disabled while rolling, so rolls can't overlap or be spammed.
- **Reduced-motion aware**: when reduced motion is preferred (in-app setting or OS), the roll is skipped and the pick is revealed instantly. Intermediate frames are never announced to screen readers; only the final selection is (`aria-live`).

**Eligibility & scope**
- **Movies vs TV Shows selector**: an accessible segmented control scopes the pool before the pick/roll. Default: Movies if eligible, else TV, else Movies.
- **Released-only**: known-future titles are excluded (future release date, or future year when no date; unknown dates are never auto-excluded). Backed by an optional, backward-compatible `releaseDate` on the persisted title snapshot (older libraries stay valid).
- **Eligibility is now `Want to Watch` only** — Cinema Mode is for choosing something *new to start*, so `Watching` (and `Completed` / `On Hold` / `Dropped`) titles are not offered. Marking a pick as Watching therefore removes it from future rolls naturally, with no extra session/exclusion state. This affects Cinema Mode only — Library and status behavior elsewhere are unchanged.

**CTAs & empty states**
- Removed the confusing **`Start Watching`** CTA (sounded like streaming and didn't work). Cinema Mode now offers **View Details**, **Mark as Watching** (only when the pick is Want to Watch; persists via the normal store/Repository path and then removes itself), and **Spin Again**.
- **Accurate empty states**: distinct, non-misleading copy for "no Want-to-Watch of this type" vs. "all unreleased" vs. "none of this type" vs. an empty library.

**Centralized & tested**: eligibility lives in a single pure `cinema-mode/eligibility` helper (`isWantToWatch` / `isReleased` / `eligibleCandidates` / `defaultCinemaType`); roll framing is pure (`buildRollFrames` / `rollFrameDelay`). No TMDB/Discover/Home/Recommendation changes; no storage migration.

> Tagged **v1.0.2**.

---

## [1.0.1] — 2026-06-29 — TMDB content quality & Discover relevance 🎯

A focused post-`v1.0.0` data-quality patch (not a new phase, not Phase 10). Keeps the premium, poster-first feel by preventing low-quality, placeholder-like, or low-relevance TMDB records from dominating default browsing — while keeping direct search permissive. Health gate green (typecheck / lint / 206 tests / build).

**Content-quality filtering (new, pure, tested)**
- Added `releaseDate: string | null` to the mapped `TmdbTitle` (raw TMDB mapping stays separate from display-quality filtering).
- New pure helper `domain/contentQuality.ts` — `isDisplayableTitle` / `filterDisplayableTitles`, injectable `now`, no hardcoded blacklist, no in-place mutation. Rules: usable title (not blank/`Untitled`), usable artwork, and movies excluded when releasing more than ~18 months out (TV is never excluded by the movie-only date rule).

**Per-surface policy — strict Home, strict Upcoming, moderate Discover, safe Newest, permissive Search**
- **Home rails** — strict, poster-first: poster **required** + far-future protection + usable title.
- **Upcoming rail** — switched `/movie/upcoming` → date-windowed `/discover/movie` (`release_date ∈ [today, +18mo]`, popularity-sorted) + strict filter. Excludes far-future placeholders (e.g. 2031/2099 records).
- **Discover default browse** — **relevance-oriented**: default sort changed from **Newest → Popular**; a centralized `DISCOVER_VOTE_FLOOR` relevance floor (`vote_count.gte`); a **moderate** display filter (poster **or** backdrop). Broad/genre browsing (e.g. Action) now leads with recognizable titles, not obscure event/short/database records.
- **Discover "Newest"** — still available (not default), now **safe**: capped at today (no future placeholders) with a lower vote floor (`recent`) so genuinely new releases still surface without dropping to database junk.
- **Recommendations & Similar** — strict, poster-first.
- **Direct search** (Discover query + autocomplete) — **permissive**, no quality filter: explicit intent wins, so `Avatar 5` / `100 Years` / obscure titles still appear.

**Thresholds (centralized & documented in `DISCOVER_VOTE_FLOOR`)**
- `relevance: 100` (Popular / Top-rated / A–Z / Oldest) — drops events/shorts/unverified records without a per-title detail fetch.
- `recent: 20` (Newest) — keeps new releases (few votes yet) visible.

**Tests** — content-quality rules (artwork/title/far-future/TV/unknown-date), strict-vs-moderate surface policy, `buildDiscoverParams` (Popular default + relevance floor; Newest cap + recent floor; broad omits genre/year; pass-through), `useDiscoverParams` default sort = Popular, and permissive search.

> Tagged **v1.0.1**.

---

## [1.0.0] — 2026-06-28 — Polish & Hardening · First stable release 🚀

### Phase 9 — Polish & Hardening
Brought WatchVerse from feature-complete to v1.0 quality — accessibility, reliability, offline/PWA, and calm error handling, with no new product scope. Health gate green (typecheck / lint / 185 tests / build).
- **Mobile navigation**: an accessible `sm:hidden` disclosure menu exposing every major route (Home, Dashboard, Discover, Library, Collections, Cinema, Settings) — active route announced, closes on selection/Escape/scrim, no hover dependence. Nav items shared between the desktop bar and mobile menu.
- **App-level error handling**: route `errorElement` renders a calm, on-brand fallback **inside the shell** (nav/footer preserved), with a root-level fallback for shell failures and a `*` catch-all 404. Distinguishes 404 vs. unexpected error, reassures that local data is safe, and offers Back to Home / Reload.
- **Offline/TMDB**: audited Home, Discover, Title detail, rails, recommendations, and search — all fail calmly (offline/error/retry, no infinite spinners); local-library surfaces remain fully usable offline.
- **PWA icons**: on-brand **SVG** install icons (standard + maskable, Cinema-Dark tokens) wired into the manifest and as favicon/apple-touch-icon; documented as placeholders for future finalized art/PNG fallbacks. (Was an empty `icons: []`.)
- **Reduced-motion consistency**: Framer Motion `MotionConfig` is driven by the in-app preference (`on→always` / `off→never` / `system→user`), aligning JS-driven motion (Cinema Mode reveal) with the CSS `data-motion` mechanism so the setting overrides the OS in either direction.
- **Empty-state sweep**: verified across all surfaces; improved the Library filtered-empty copy to account for the tag filter.
- **Performance**: confirmed healthy chunking (Recharts/dashboard stays lazy + separate); `content-visibility` on large lists; added `decoding="async"` to posters. Measured, low-risk only — no architecture changes.
- **Command palette**: a minimal, accessible, routes-only jump (Cmd/Ctrl+K, Radix dialog, combobox/listbox semantics). Deliberately not a quick-action framework.
- **App version** now sourced from `package.json` via a Vite `define` (no more hardcoded drift).
- 16 new tests across Settings, onboarding, reduced-motion, mobile nav, route errors, and the command palette (two checkpoints).

> Tagged **v1.0.0** — the first stable release. WatchVerse is no longer a work-in-progress prototype.

---

## [0.6.0] — 2026-06-28 — Achievements & Activity 🏆

### Phase 8 — Achievements & Activity
Meaningful, low-noise delight from local data. Health gate green (typecheck / lint / 169 tests / build).
- **Declarative achievement engine** (`domain/achievements.ts`): a small, understandable catalog (7) with pure, deterministic rule predicates over an `AchievementContext` derived from **local data only**. Achievements are never a source of truth for statistics.
- **Persistence & celebration**: unlock records persist via the async Repository (`achievementsStore`) purely to prevent repeated celebrations / preserve unlock history. A reduced-motion-aware toast celebrates new unlocks; a Dashboard panel shows the full catalog with locked entries dimmed (state announced to screen readers, not color-only) and an encouraging empty state.
- **First-run reconciliation** is silent — pre-existing/imported unlocks are reconciled into persistence with **no toast burst and no historical activity spam**; only genuinely-new unlocks celebrate and log activity.
- **Activity timeline** (`activityStore`): local, capped (500), human-readable events (added, status changed, completed, rated, reviewed, TV completed, collection created, achievement unlocked). **Collapses consecutive same-event repeats** so rating drags / review autosaves don't spam. Dashboard "Recent activity" section with relative timestamps and an empty state.
- **Mutation-safe logging**: `persistUpdate` returns the persisted entry; activity is logged **strictly after successful persistence**, so a failed optimistic mutation rolls back user data and leaves **no false activity**. Completion logs a single completion-oriented entry (no "status changed" + "completed" pair).
- **Import/export** preserves achievements and activity (replace overwrites; merge unions) — tested round-trip.
- All persistence through the async Repository; no `localStorage` outside it. No social/sharing/accounts/cloud; no stats/recommendations/TV-scope creep. 20 new tests.

> Tagged **v0.6.0**.

---

## [0.5.0] — 2026-06-28 — Dashboard & Statistics 📊

### Phase 7 — Dashboard & Statistics
Derived insight into watching habits. Health gate green (typecheck / lint / 149 tests / build).
- **Pure stats calculator** (`domain/stats.ts`): movies/shows watched (Completed only), total completed, **estimated watch hours incl. rewatches** (documented constants — snapshots don't store runtimes), completion %, status breakdown, average rating, ratings distribution, recently completed. Derived only — never persisted.
- **Dashboard** (`/dashboard`): stat cards, status breakdown bars, ratings **bar chart** (Recharts) with a text summary + sr-only data table, **Top 3 movies/shows**, recently completed, quick links to Library/Collections/Discover/Cinema; thoughtful empty + small-library states.
- **Profile**: editable local display name (`profileStore`); local-first, no accounts/avatars/auth/sync.
- **Lazy-loaded dashboard route** keeps Recharts in a separate chunk (~102 KB gzip), so the main bundle stays ~200 KB gzip.
- 9 new tests (stats math, profile persistence, dashboard render + name edit).

> **Note — Favorite Genres:** Favorite Genres were intentionally omitted in Phase 7 because the approved persisted entry snapshot does not store genre IDs. This avoids a non-essential data-model revision and migration. The feature can be revisited later if genre IDs become part of the approved snapshot model.

> Tagged **v0.5.0**.

---

## [0.4.0] — 2026-06-28 — Collections & Tags 🗂️

### Phase 6 — Collections & Tags
Organization features. Health gate green (typecheck / lint / 142 tests / build).
- **Collections** (curated groups): create/rename/delete (confirmed), membership via a detail picker (inline create-and-add), `/collections` list (with counts) + `/collections/:id` detail screens, empty/not-found states; deleting a collection **detaches its id from every entry**.
- **Tags** (lightweight labels): create/rename/delete via a "Manage tags" dialog; apply/remove via a detail picker; tag **chips on library cards**; **filter the Library by tag**; deleting a tag detaches it from entries.
- Membership stored on `LibraryEntry.collectionIds`/`tagIds` (references, not copies); all mutations through the **async Repository**; no `localStorage` outside it.
- **Import/Export** preserves collections, tags, and memberships (tested round-trip).
- Acyclic feature deps kept (`title-details → {library, collections, tags}`, `collections → library`, `library → tags` for chips); 26 new tests.

> Tagged **v0.4.0**.

---

## [0.3.0] — 2026-06-28 — Home, Recommendations, Cinema Mode & Search History 🎬

### Phase 5 — Home, Recommendations, Cinema Mode & Search History
Strong landing experience and personal-discovery flows. Health gate green (typecheck / lint / 117 tests / build).
- **Home** is the landing page (`/`); Discover moved to `/discover`; nav: Home / Discover / Library; global search routes to Discover.
- **Rails:** Trending, Popular movies, Upcoming, Popular TV, Popular anime (curated Discover), plus local **Recently added**. Cold-start stays full via TMDB rails; failing/empty rails hide; **offline notice**; **all-rails-fail + empty-library fallback** added.
- **Recommended For You:** rules-based, transparent (`Because you liked …`), seeded from completed/highly-rated titles, excludes library, deduped/ranked; **falls back to top-rated** "Popular picks to get started" for small/empty libraries (distinct from the Popular rail; never pretends to be personalized).
- **Cinema Mode** (`/cinema`): premium random picker from the **watchlist** (Want/Watching), avoids immediate repeats, "Start watching"/"View details"/"Spin again", graceful empty state; reduced-motion-friendly reveal.
- **Search history:** local, Repository-persisted (dedup, cap), reusable, with per-item remove + clear-all.
- **Autocomplete combobox:** the deferred Phase 2 dropdown — recent searches when empty, TMDB title suggestions while typing; keyboard (↑/↓/Enter/Esc), `aria-activedescendant`, labelled listbox/options.
- 21 new tests (recommendation rules + fallback, Cinema Mode pure + UI, search-history persistence, combobox keyboard/history, Home personalized + fallback).

> Tagged **v0.3.0**.

---

## [0.2.0] — 2026-06-28 — TV Season Tracking 🎬
Season-level TV tracking (Phase 4). Health gate green (typecheck / lint / 96 tests / build).

### Phase 4 — TV Season Tracking
- **Data model:** TMDB season schema + `TitleSeason`; `TitleDetail.seasons` (empty for movies); season mapping (sorted).
- **Store:** `setCurrentSeason` (implies Watching from Want), `toggleSeasonCompleted`, `setShowCompleted` (sets status Completed + default watch date) — all via the async Repository, guarded to TV entries.
- **UI:** `TvSeasonsPanel` on TV detail — season list (poster, episode count, year), set-current-season, per-season "Done", and show-completed controls (shown when tracked).
- **Spoiler protection:** when the setting is on, unwatched-season overviews are **not rendered to the DOM at all** (hidden from screen readers as well as visually), shown as an "Overview hidden to avoid spoilers" placeholder with an intentional, keyboard-accessible **Reveal** action; revealing renders the real, readable overview. No full Settings UI yet.
- 12 new tests (store TV progress + persistence, season mapping, season-panel interactions; spoiler tests assert the overview text is absent from the DOM until revealed).

> Tagged **v0.2.0**.

---

## [0.1.0] — 2026-06-28 — First usable release (ship line) 🎬
WatchVerse is now a usable, data-safe personal tracker (Phases 1–3). Health gate green (typecheck / lint / 84 tests / build).

### Phase 3 — Tracking + Data Safety
- Add/remove titles; five watch statuses; quick add/status actions on Discover cards, rows, Detail, and similar titles (PRD-SYS-11).
- Personal **rating** (0.5 steps; keyboard/mouse/touch; accessible slider semantics + numeric value, valid cleared state); **review** (single canonical field, ≤500 chars, autosave + live counter); **watch date** (validated, not future; auto-defaults on Completed); **rewatch count** (clamped non-negative).
- **Library screen**: filter by status, sort, grid/list, empty states, navigation to detail; CSS `content-visibility` for large-library performance.
- **Import/Export**: JSON export; validated import with **Merge** (default) and **Replace** (deliberate, confirmed) modes; clear feedback; no silent data loss.
- **Data safety**: destructive **confirmation dialogs** honoring `confirmBeforeDelete`; **Undo** on removal; centralized validation/normalization; all mutations via the async Repository.
- 84 tests including import/export round-trip, invalid-import, merge-vs-replace, destructive-confirm, and control interactions.
- Added: `@radix-ui/react-dropdown-menu` (status menu), `@radix-ui/react-dialog`-based Modal/ConfirmDialog, `asChild` Button (Radix Slot).

> Tagged **v0.1.0**.
>
> **Implementation note (performance):** Phase 3 uses CSS `content-visibility` for large-library rendering instead of JS windowing. This is an accepted Phase 3 performance tradeoff; JS virtualization can be added later only if measurement shows it is necessary. (Keeps the "virtualized/performance-safe" requirement satisfied without adding complexity now.)

---

### Phase 2 — Discover & Title Detail (2026-06-28) ✅
WatchVerse is now browsable through TMDB. Health gate green (typecheck / lint / 47 tests / build).
- **Discover/Search:** debounced, URL-driven search (movies + TV), genre/year filters, sort, grid/list view, infinite "Load more"; global search in the app shell; full four-state handling (loading/empty/error/offline).
- **Title detail (movie + basic TV):** backdrop, poster, overview, year/runtime/genres, TMDB rating, cast, director/creator, trailer link, similar titles; read-only library status; graceful missing-data handling.
- **TMDB:** detail schemas + mappers (credits/videos/similar), `useTitleDetails`, `useDiscoverTitles` (infinite), `useGenres`; `TmdbTitle` gains `genreIds`.
- **Shared:** `TitleCard` promoted to `shared/ui`; added `StatusBadge`, `Select`; hooks `useDebounce`, `useOnlineStatus`, `useLibraryStatusLookup`; `formatRuntime`.
- **Tests:** MSW infrastructure + integration tests for Discover (happy/empty/error/browse) and Detail (happy/incomplete/404/500/invalid), plus filtering/debounce/detail-mapper units.
- **Boundary:** library status shown read-only; no Phase 3 tracking actions.
- **Deferred (deliberate):** Phase 2 implements debounced live search and URL-driven discovery. The **autocomplete suggestions/history dropdown is intentionally deferred to Phase 5**, where it will be implemented together with search history. The shared-element grid→detail transition is deferred to a later polish pass (hover zoom is in place).

### Phase 1 — Foundation (2026-06-28) ✅
First application code. Foundation and data backbone in place; engineering health gate green (typecheck / lint / 25 tests / build all passing).
- Tooling: Vite 5, React 18, TypeScript strict, ESLint (flat) + Prettier, Tailwind 3 wired to CSS-variable tokens, Vitest, `@/` alias.
- Design tokens (Cinema Dark) + globals (focus-visible, reduced-motion) + `cn()`; self-hosted Sora + Inter.
- Core UI kit: Button, Card, Poster, Input, Skeleton, EmptyState.
- Domain layer: enums, Zod schemas (single source of truth), inferred types, factories/defaults.
- Data-access: async `LibraryRepository` + LocalStorage implementation, validated storage adapter (quarantine-on-corruption), migration runner, KeyValueStore seam (memory impl for tests).
- TMDB: typed client (error vocabulary), response schemas, mappers, `useTrending` query hook, image helper.
- State: Zustand `libraryStore` (optimistic + rollback) and `settingsStore`, hydrating from the Repository.
- App shell: providers (QueryClient, RepositoryProvider, Toaster), routing skeleton, temporary FoundationDemo screen.
- PWA: manifest + Workbox service worker via vite-plugin-pwa (icons deferred to 06-assets).
- Decision: ESLint pinned to 8.57 for plugin compatibility; simple `tsc --noEmit` over project references (both consistent with ADR-000).

Next: **Phase 2 — Discover & Title Detail (movies)** ([Development Roadmap](./development-roadmap.md)).

---

## Documentation phase

### 2026-06-27

#### Approved & locked
- **`00-overview`** approved (Documentation v1.0): executive-summary, product-vision, product-principles (incl. "Your Data Is Sacred" and "Documentation Is a Product"), anti-goals, success-metrics, glossary.
- **`01-product`** approved: PRD, functional-specifications, user-flows.
- **`02-design`** approved: brand-identity, design-system, ux-accessibility-motion.
- **`03-architecture`** approved: architecture-overview, technical-specifications, data-models, state-and-persistence, tmdb-integration, pwa-and-offline, security-and-privacy, srs.
- **`04-engineering`** approved: folder-structure, coding-standards, testing-strategy.

#### Decisions (ADRs)
- **ADR-000 — Architecture Philosophy** accepted: prefer maintainability, clarity, predictability, simplicity over cleverness/abstraction.
- **ADR-001 — Repository Pattern (async-by-default)** accepted: single async persistence boundary; LocalStorage now, IndexedDB/backend later with no UI changes.
- ADR-002–008 recorded in the decisions **backlog** (reasoning lives in owning docs; promoted on demand).

#### Tracked revisions to approved documents
- **success-metrics.md → v1.1:** **M7** retitled "Search feels instantaneous" → "Search stays responsive" / "Search interactions must remain responsive regardless of network latency." Reason: specify a measurable UX expectation rather than promise impossible network performance. Prior wording preserved in the doc's revision note.
- **product-vision.md → v1.1:** one-sentence vision reworded "personal cinema" → "personal cinema journal" for brand consistency with Brand Identity.
- **executive-summary.md → v1.1:** "personal cinema" → "personal cinema journal" (same reason).
- *(anti-goals.md unchanged — its "a personal cinema — a … journal" phrasing was already aligned.)*

#### Key product/architecture decisions captured during planning
- Notes and Reviews merged into a single canonical **Review** (≤500 chars).
- Random picker and Cinema Mode merged into one feature.
- **Season-level** TV tracking for v1.0 (per-episode deferred, model kept episode-ready).
- **Two media types** (Movie, TV); "anime" as a curated TMDB Discover category.
- Import default = **Merge**; **Replace** as deliberate secondary.
- Statistics: "Shows Watched" counts Completed only; estimated watch hours include rewatches.
- Status colors finalized (Want = soft orange; gold reserved for earned/exceptional); status always shown as **color + icon + label**.
- Typography: **Sora** (display) + **Inter** (body).
- Browser support: latest two versions of Chrome, Edge, Firefox, Safari (desktop + mobile).
- Tests co-located as `*.test.ts(x)`; E2E under `test/e2e/`.

---

## How to update this changelog
- Add an entry under **[Unreleased]** as work is done; on a release, move it under a dated, versioned heading.
- Record every **tracked revision to an approved document** (with reason) and every **ADR** status change.
- Keep entries human-readable and concise; link the owning document for detail.

---

### Related documents
- [Development Roadmap](./development-roadmap.md) — the plan
- [Progress Checklist](./progress-checklist.md) — the current status
- [ADRs](../03-architecture/decisions/README.md) — decision records this log references
