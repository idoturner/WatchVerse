---
title: Development Roadmap
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 05-delivery
related:
  - ./progress-checklist.md
  - ./changelog.md
  - ../01-product/prd.md
  - ../03-architecture/architecture-overview.md
  - ../04-engineering/folder-structure.md
---

# Development Roadmap

> **Purpose.** The authoritative sequencing plan for building WatchVerse: the ordered phases, what each delivers, and the rules that keep delivery clear, phased, and reviewable. This document **owns sequencing** — if it and the [PRD §5 phase table](../01-product/prd.md) ever differ, this document wins and the PRD is updated to match.
>
> **Owns:** phase ordering, per-phase goals/deliverables, and the delivery method.
> **Does not own:** feature requirements ([PRD](../01-product/prd.md)); behavior ([Functional Specifications](../01-product/functional-specifications.md)); current build status ([Progress Checklist](./progress-checklist.md)).

---

## 1. Delivery principles
- **Hybrid build** ([approved](./changelog.md)): a tiny token + core-kit foundation is built first, then the design system grows **alongside** the first screens. Not a full design system up front, not ad-hoc per screen.
- **Phased and reviewable.** Each phase is small enough to review before the next begins ([Quality Over Quantity](../00-overview/product-principles.md)).
- **The ship line is the end of Phase 3.** After Phase 3, WatchVerse is a usable, beautiful tracker; everything after is additive.
- **"Done" is real done.** A phase is complete only when its screens meet the four-state contract, the per-screen accessibility checklist, and the relevant NFRs ([SRS](../03-architecture/srs.md)) — not when it merely renders.
- **One phase in flight at a time.** Implementation quality over volume, per the agreed engineering-phase priority.
- **Continuous deployability.** Every completed phase leaves the application in a **deployable, working state** — no phase ends with partially integrated work or a broken app. Each completed phase is a stable checkpoint that could reasonably be demonstrated, reviewed, or released.
- **Engineering health gate.** A phase is **not complete** unless the project's engineering health is intact at its end: the app **builds successfully**, **TypeScript reports zero errors**, **ESLint reports zero errors**, and **all tests relevant to that phase pass**. A feature is done only when it integrates cleanly into a healthy codebase — not merely when it works. This applies from **Phase 1 onward**.

---

## 2. The phases

### Phase 1 — Foundation & data backbone
**Goal:** the skeleton everything else stands on.
- Vite + TS strict + ESLint/Prettier; `@/` alias; CI gates ([Coding Standards](../04-engineering/coding-standards.md)).
- `styles/tokens.css` (Cinema Dark tokens) + **core kit**: Button, Card, Poster, Input, Skeleton, EmptyState, plus `cn()` ([Design System](../02-design/design-system.md)).
- Providers: QueryClient, **RepositoryProvider**, Toaster, theme; routing skeleton.
- Data backbone: `tmdbClient` + Zod schemas + mappers + first Query hooks; `domain/` types/schemas/enums; **`LibraryRepository` (async)** + `LocalStorageLibraryRepository` + storage adapter + migration runner; Zustand stores hydrating from the Repository.
- PWA shell (manifest + service worker scaffolding).
- **Deliverable:** a running shell + a design-system demo; data flows proven by unit tests. *Internal.*

### Phase 2 — Discover & title detail (movies)
**Goal:** browse all of TMDB beautifully.
- Search (movies + TV engine) with debounced autocomplete, genre/year filters, sort, grid/list; URL-driven state; global search reachable everywhere.
- Movie detail page (backdrop/poster/overview/cast/director/trailer/TMDB rating/similar) with shared-element transition.
- TMDB attribution in place.
- **Deliverable:** a browsable product. *Usable.*

### Phase 3 — Tracking + data safety  ⟵ **SHIP LINE**
**Goal:** the reason the app exists.
- Add/remove library; five watch statuses; quick actions; library status visible everywhere (`PRD-SYS-11`).
- Rating (0.5, keyboard/mouse/touch); Review (≤500, autosave); watch date; rewatch count.
- Library screen (filter/sort/grid-list; virtualized).
- **Import/Export (JSON)** + **undo/confirm on destructive actions**.
- **Deliverable:** a usable, beautiful, data-safe tracker. *Ship-worthy.*

### Phase 4 — TV season tracking
**Goal:** TV is genuinely useful.
- Season list + current-season/progress + completion; episode-ready data model (no per-episode UI).
- Spoiler-protection behavior wired (setting added in Phase 9 UI).
- **Deliverable:** TV-capable tracking.

### Phase 5 — Home, recommendations, Cinema Mode, search history
**Goal:** the landing experience.
- Home rails (trending/popular/upcoming/anime/recent + recently-added) with first-class cold-start empty states.
- **Recommended For You** (rules-based, cold-start fallback); **Cinema Mode** random picker; **search history**.
- **Deliverable:** the front door.

### Phase 6 — Organization
**Goal:** curation.
- Collections (CRUD, membership) + Tags (CRUD, apply, filter-by-tag).
- **Deliverable:** a curatable library.

### Phase 7 — Dashboard & statistics
**Goal:** insight.
- Profile (editable name); statistics (pure calculators; Shows Watched = Completed; watch hours include rewatches); charts; Top 3 lists; favorite genres; completion %.
- **Deliverable:** a rewarding dashboard, welcoming at any library size.

### Phase 8 — Achievements & activity
**Goal:** reward & history.
- Declarative achievement engine + catalog + unlock celebration (reduced-motion aware); activity timeline (capped).
- **Deliverable:** retention-friendly delight.

### Phase 9 — Polish & hardening
**Goal:** make it feel finished.
- Onboarding/first-run; full Settings UI (incl. theme-switcher scaffold, reduced-motion, spoiler protection); command palette (deferred feature lands here).
- Accessibility audit pass (WCAG 2.1 AA), performance pass (virtualization/splitting/images), offline/error-boundary sweep, empty-state sweep.
- **Deliverable:** a polished, accessible, performant v1.0.

### Phase 10 — Backend readiness (optional, on demand)
**Goal:** prove the boundary.
- Implement `ApiLibraryRepository`; one-time local→server sync from the export format; auth; optional TMDB proxy.
- **No UI changes required** — the payoff of [ADR-001](../03-architecture/decisions/0001-repository-pattern.md).
- **Deliverable:** cloud-ready (only if/when desired).

---

## 3. Phase summary & versioning

| Phase | Theme | Primary `PRD` areas | Target version | Significance |
| --- | --- | --- | --- | --- |
| 1 | Foundation + data backbone | SYS, SET(store) | 0.0.x | Internal |
| 2 | Discover & detail (movies) | SRCH, DET, GLOB | 0.0.x | Browsable |
| 3 | Tracking + data safety | LIB, RATE, REV, DATA | **0.1.0** | **Ship line** |
| 4 | TV season tracking | DET-TV | 0.2.0 | TV-capable |
| 5 | Home, REC, Cinema, history | HOME, REC, CINE, HIST | 0.3.0 | Front door |
| 6 | Organization | COLL, TAG | 0.4.0 | Curation |
| 7 | Dashboard & stats | PROF, STAT | 0.5.0 | Insight |
| 8 | Achievements & activity | ACH, ACT | 0.6.0 | Delight |
| 9 | Polish & hardening | ONB, SET, a11y/perf | **1.0.0** | Finished v1.0 |
| 10 | Backend readiness | — | 1.1.0+ | Optional future |

### Versioning (Semantic Versioning)
WatchVerse adopts **Semantic Versioning** (`MAJOR.MINOR.PATCH`) from the first usable release:
- Pre-ship work (Phases 1–2) stays in **0.0.x**.
- **Phase 3 ships `v0.1.0`** — the first usable, deployable release (the ship line).
- Each subsequent phase that completes major functionality increments the **minor** version (`0.2.0`, `0.3.0`, …).
- **`v1.0.0` is reserved for the completion of Phase 9** — WatchVerse's planned production-ready release.
- Post-1.0 work (e.g. Phase 10) continues at `1.1.0+`.
- **Patch** versions cover fixes between releases. Releases are tagged and recorded in the [Changelog](./changelog.md).

---

## 4. Risk reference
The risks identified in planning (scope creep, per-episode data volume, TMDB key exposure, LocalStorage limits, re-render storms, motion overuse, cold-start emptiness, a11y-late) are mitigated by this sequencing and the architecture. The mitigations live in their owning docs ([SRS](../03-architecture/srs.md), [State & Persistence](../03-architecture/state-and-persistence.md), [Security & Privacy](../03-architecture/security-and-privacy.md), [Architecture Overview](../03-architecture/architecture-overview.md)); this roadmap's main risk control is **the hard Phase-3 ship line and one-phase-at-a-time discipline**.

---

### Related documents
- [Progress Checklist](./progress-checklist.md) — the living status of these phases
- [Changelog](./changelog.md) — what has actually shipped/changed
- [PRD](../01-product/prd.md) — the requirements each phase delivers
- [Architecture Overview](../03-architecture/architecture-overview.md) · [Folder Structure](../04-engineering/folder-structure.md) — how the build is structured
