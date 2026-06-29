---
title: Testing Strategy
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 04-engineering
related:
  - ./folder-structure.md
  - ./coding-standards.md
  - ../03-architecture/srs.md
  - ../00-overview/success-metrics.md
  - ../01-product/functional-specifications.md
---

# Testing Strategy

> **Purpose.** How WatchVerse is tested: the testing pyramid, what gets tested at each level, the tools, conventions, and how tests trace back to requirements and non-functional requirements. Practical and proportionate — enough to ship with confidence, not testing for its own sake.
>
> **Owns:** the testing approach, levels, tooling, and coverage expectations.
> **Does not own:** the requirements/behavior being tested ([PRD](../01-product/prd.md), [Functional Specifications](../01-product/functional-specifications.md)); the NFR thresholds ([SRS](../03-architecture/srs.md)).

Guided by [ADR-000](../03-architecture/decisions/0000-architecture-philosophy.md): test what is most likely to break and most costly if it does — heavily where logic is pure and consequences are high (user data), lightly where churn is high and value is low.

---

## 1. Philosophy & priorities
- **Test behavior, not implementation.** Tests should survive refactors that preserve behavior.
- **Confidence per effort.** Concentrate on the **domain layer** (pure, high-value, cheap to test) and the **critical user flows** (high cost of failure).
- **Data safety is the highest-priority test target** ([Your Data Is Sacred](../00-overview/product-principles.md)): migrations, validation, and the export→import round-trip.
- Tests are part of "done"; a screen isn't complete until its behavior and four states are verified ([Quality Over Quantity](../00-overview/product-principles.md)).

---

## 2. The testing pyramid

```
        ╱ E2E (Playwright) — a few critical journeys ╲
      ╱ Integration (RTL + MSW) — features & flows     ╲
    ╱ Unit (Vitest) — domain logic, utils, stores        ╲
```

### 2.1 Unit — Vitest (the broad base)
The largest share, because it's where the highest-value, purest logic lives:
- **`domain/stats`** — every statistic formula, including the resolved definitions (Shows Watched = Completed only; watch hours include rewatches) ([Functional Specifications §10.1](../01-product/functional-specifications.md)).
- **`domain/achievements`** — rule evaluation, idempotency (no double-unlock), re-evaluation after import.
- **`domain/recommendations`** — scoring, cold-start fallback, dedup, determinism.
- **`data/repository/localStorage/migrations`** — every migration path; never lose data across versions.
- **Zod schemas** — accept valid, reject/quarantine invalid.
- **`shared/lib`** utilities and **store actions** (with a fake/in-memory Repository).

### 2.2 Integration — React Testing Library + MSW
Features tested as the user experiences them, with **TMDB mocked via MSW** ([Technical Specifications](../03-architecture/technical-specifications.md)):
- The **four-state contract** per data view: loading (skeleton), empty, error, offline ([Functional Specifications §1.1](../01-product/functional-specifications.md)).
- Core interactions: add to library, change status, rate (mouse/keyboard), write/clear a review (500-char cap), tag, collection membership.
- **Library status visibility** (`PRD-SYS-11`): a tracked title shows its status across search/rails.
- Optimistic update + rollback on simulated persistence failure.
- Keyboard operability of interactive components.

### 2.3 E2E — Playwright (a deliberate few)
Only the journeys whose failure would most hurt, run against a real build:
- Search → open detail → add → set status → rate/review.
- Track a TV show by season to completion.
- **Export → import round-trip** reproduces the library faithfully (the sacred-data invariant, [NFR-DATA-5](../03-architecture/srs.md)).
- Offline: load installed app offline, browse/edit local library.

We keep E2E intentionally small (slow, higher-maintenance); depth lives in unit/integration.

---

## 3. Accessibility & performance testing
- **Accessibility (WCAG 2.1 AA, [NFR-A11Y](../03-architecture/srs.md)):** automated checks (e.g. `axe`) in integration tests for key screens; the per-screen **manual checklist** ([UX, Accessibility & Motion §2.4](../02-design/ux-accessibility-motion.md)) including keyboard-only walkthrough and a screen-reader spot-check on primary flows; **contrast verification** of tokens before the Design System is locked.
- **Performance ([NFR-PERF](../03-architecture/srs.md)):** seed a **1,000+ title fixture** and profile library scroll/interaction (~60fps), verify list virtualization, and manual search-latency checks on a throttled profile. Not micro-benchmarked — measured against the stated budgets.
- **Reduced motion:** verify non-essential motion is suppressed when set ([M14](../00-overview/success-metrics.md)).

---

## 4. Conventions
- **Location:** unit/integration tests live next to the code as `*.test.ts(x)`; E2E under `test/e2e/`. Shared MSW handlers, fixtures, and helpers in `src/test/`.
- **Naming:** describe behavior (`"marks a show completed and updates Shows Watched"`), not implementation.
- **Queries:** prefer role/label/text queries (accessible by construction) over test-ids; test-ids only when necessary.
- **No network in tests:** TMDB is always mocked (MSW). The Repository uses an in-memory implementation in unit/integration tests.
- **Determinism:** no real time/random in assertions — inject clocks/seeds (recommender and IDs).
- **Each test is independent** (fresh store/Repository/storage per test).

---

## 5. Coverage expectations
- **High/near-complete** coverage of `domain/` and `migrations` (pure, critical) — these are effectively non-negotiable.
- **Meaningful** coverage of stores, repository, and core feature interactions.
- **Light** coverage of purely presentational components (visual, low-logic) — don't chase a percentage on markup.
- Coverage is a **guide, not a target**: we do not game a number ([ADR-000](../03-architecture/decisions/0000-architecture-philosophy.md)). A missing test on a data-mutation path is a real gap; a missing test on a static layout is usually fine.

---

## 6. Traceability to requirements
Tests reference the IDs they verify so the chain **requirement → behavior → test** stays intact:
- `PRD-*` (features) and [Functional Specifications](../01-product/functional-specifications.md) sections → integration/E2E tests.
- `NFR-*` ([SRS](../03-architecture/srs.md)) → the corresponding a11y/perf/data tests.
- UX metrics `M*` ([Success Metrics](../00-overview/success-metrics.md)) → the checks in §3 and E2E.

---

## 7. CI
- On every push/PR: **type-check, lint, unit + integration tests, and a dependency audit** must pass to merge ([Coding Standards §10](./coding-standards.md), [Security & Privacy §5](../03-architecture/security-and-privacy.md)).
- E2E runs on the main branch and before release (and on PRs touching critical flows).
- A failing required check blocks merge — green is the only mergeable state.

---

### Related documents
- [SRS](../03-architecture/srs.md) — the NFRs (PERF/A11Y/DATA/…) these tests verify
- [Functional Specifications](../01-product/functional-specifications.md) — the behavior and four-state contract under test
- [Coding Standards](./coding-standards.md) — conventions tests also follow
- [Success Metrics](../00-overview/success-metrics.md) — the UX targets validated here
- [Folder Structure](./folder-structure.md) — where tests live
