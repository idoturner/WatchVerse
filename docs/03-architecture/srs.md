---
title: Software Requirements Specification (SRS)
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./architecture-overview.md
  - ../01-product/prd.md
  - ../00-overview/success-metrics.md
  - ../02-design/ux-accessibility-motion.md
  - ../04-engineering/testing-strategy.md
---

# Software Requirements Specification (SRS)

> **Purpose.** This document defines the **non-functional requirements** (NFRs) of WatchVerse — the measurable "-ilities" the system must satisfy: performance, accessibility, reliability/data-integrity, offline/PWA, security/privacy, compatibility, and maintainability. Each is stated as a numbered, testable requirement.
>
> **Owns:** non-functional requirements and their acceptance thresholds.
> **Does not own:** functional features ([PRD](../01-product/prd.md)); behavior detail ([Functional Specifications](../01-product/functional-specifications.md)); UX targets in product terms ([Success Metrics](../00-overview/success-metrics.md)) — this doc is the engineering-side mirror of those.

**Requirement IDs:** `NFR-<CATEGORY>-<n>`, permanent and referenced by the [Testing Strategy](../04-engineering/testing-strategy.md). Where an NFR mirrors a UX metric, the `Mn` is linked.

---

## 1. Performance (`NFR-PERF`)

| ID | Requirement | Threshold | Mirrors |
| --- | --- | --- | --- |
| NFR-PERF-1 | Visible feedback for any user action | ≤ 100 ms | [M6](../00-overview/success-metrics.md) |
| NFR-PERF-2 | Local-library search result update after keystroke | ≤ 100 ms (input never blocked) | [M7](../00-overview/success-metrics.md) |
| NFR-PERF-3 | Remote (TMDB) search: skeleton shown immediately; results | ≤ ~1 s on a normal connection | [M7](../00-overview/success-metrics.md) |
| NFR-PERF-4 | Scrolling/interaction with a 1,000+ title library | smooth, ~60 fps, no jank | [M9](../00-overview/success-metrics.md) |
| NFR-PERF-5 | Lists exceeding ~100 items | virtualized | [M9](../00-overview/success-metrics.md) |
| NFR-PERF-6 | Store subscriptions | selector-based (no whole-store re-renders) | — |
| NFR-PERF-7 | Routes | code-split/lazy-loaded; small initial bundle | — |
| NFR-PERF-8 | Animations | `transform`/`opacity` only; never block input | [M8](../00-overview/success-metrics.md) |
| NFR-PERF-9 | Derived data (stats/recommendations) | memoized; computed lazily, off the render path | — |
| NFR-PERF-10 | App shell launch (installed PWA) | instant from precache, incl. offline | [M11](../00-overview/success-metrics.md) |

---

## 2. Accessibility (`NFR-A11Y`) — target: WCAG 2.1 AA

| ID | Requirement | Mirrors |
| --- | --- | --- |
| NFR-A11Y-1 | Conform to **WCAG 2.1 Level AA** | [PRD-SYS-6](../01-product/prd.md) |
| NFR-A11Y-2 | Every interactive element keyboard-reachable and operable; no unintended traps | [M13](../00-overview/success-metrics.md) |
| NFR-A11Y-3 | Visible, consistent focus indicator on all focusable elements | — |
| NFR-A11Y-4 | Focus management: into/out of overlays; to main region on route change | — |
| NFR-A11Y-5 | Text/UI contrast ≥ 4.5:1 (normal), ≥ 3:1 (large/essential UI) — verified in [UX, A11y & Motion §2.3](../02-design/ux-accessibility-motion.md) | — |
| NFR-A11Y-6 | No information conveyed by color alone (status uses color+icon+label) | — |
| NFR-A11Y-7 | All controls have accessible names; icon-only controls labeled | — |
| NFR-A11Y-8 | Async/status changes announced via live regions | — |
| NFR-A11Y-9 | `prefers-reduced-motion` and in-app reduced-motion honored | [M14](../00-overview/success-metrics.md) |
| NFR-A11Y-10 | Touch targets ≥ 44×44px; hover affordances have touch equivalents | — |
| NFR-A11Y-11 | Primary flows verified with a screen reader | — |

The per-screen accessibility checklist ([UX, A11y & Motion §2.4](../02-design/ux-accessibility-motion.md)) is the operational gate for these.

---

## 3. Reliability & data integrity (`NFR-DATA`)

| ID | Requirement | Mirrors |
| --- | --- | --- |
| NFR-DATA-1 | No unrecoverable data loss caused by the app's own actions | [M15](../00-overview/success-metrics.md) |
| NFR-DATA-2 | All destructive actions confirmable and/or undoable | [PRD-SYS-5](../01-product/prd.md) |
| NFR-DATA-3 | All storage reads and imports validated (Zod) before use; invalid data quarantined, never crashes | — |
| NFR-DATA-4 | Schema versioned; forward migrations run on load and on import | — |
| NFR-DATA-5 | Full data export available at any time; export→import round-trips faithfully | [PRD-DATA](../01-product/prd.md) |
| NFR-DATA-6 | Persistence failures (e.g. quota) handled gracefully with optimistic rollback | — |
| NFR-DATA-7 | Activity and search-history stores bounded (capped) | — |

---

## 4. Offline & PWA (`NFR-PWA`)

| ID | Requirement | Mirrors |
| --- | --- | --- |
| NFR-PWA-1 | Installable PWA (valid manifest + icons), served over HTTPS | [PRD-SYS-3](../01-product/prd.md) |
| NFR-PWA-2 | App shell + static assets precached; app launches offline | [PRD-SYS-4](../01-product/prd.md) |
| NFR-PWA-3 | Entire local library + derived views fully functional offline | [PRD-SYS-4](../01-product/prd.md) |
| NFR-PWA-4 | Online-only features degrade to friendly offline states; no generic error screens | [M11](../00-overview/success-metrics.md) |
| NFR-PWA-5 | Non-intrusive update prompt on new version | — |
| NFR-PWA-6 | TMDB-backed views refetch automatically on reconnect | — |

---

## 5. Security & privacy (`NFR-SEC`)

| ID | Requirement |
| --- | --- |
| NFR-SEC-1 | No user data transmitted off-device in v1.0 (no backend, no account, no third-party trackers). |
| NFR-SEC-2 | Only external calls are to TMDB (api/images) and self-hosted assets. |
| NFR-SEC-3 | TMDB credential read-scoped; exposure accepted and documented; proxy path defined for Phase 10. |
| NFR-SEC-4 | No external telemetry shipped; observability seam present but unwired (ADR-008). |
| NFR-SEC-5 | User free-text rendered as text only; no raw HTML injection from user/TMDB content. |
| NFR-SEC-6 | HTTPS + scoped Content-Security-Policy; no third-party script includes. |
| NFR-SEC-7 | Dependencies pinned; audited in CI. |

Full rationale: [Security & Privacy](./security-and-privacy.md).

---

## 6. Compatibility (`NFR-COMPAT`)

| ID | Requirement |
| --- | --- |
| NFR-COMPAT-1 | Support current evergreen browsers: latest 2 versions of Chrome, Edge, Firefox, and Safari (desktop + mobile). |
| NFR-COMPAT-2 | Responsive and usable across mobile, tablet, laptop, desktop ([UX, A11y & Motion §1](../02-design/ux-accessibility-motion.md)). |
| NFR-COMPAT-3 | Service worker / PWA features degrade gracefully where unsupported (app still works as a normal web app). |
| NFR-COMPAT-4 | No dependency on device-specific or proprietary APIs. |

---

## 7. Maintainability (`NFR-MAINT`)
Per [ADR-000](./decisions/0000-architecture-philosophy.md):

| ID | Requirement |
| --- | --- |
| NFR-MAINT-1 | `localStorage`/persistence confined to the repository folder; enforced by lint where feasible. |
| NFR-MAINT-2 | `domain/` is pure (no React/storage imports); dependencies point inward. |
| NFR-MAINT-3 | Features do not import each other's internals. |
| NFR-MAINT-4 | No raw design values in components — tokens only. |
| NFR-MAINT-5 | Types derived from Zod schemas (single source of truth). |
| NFR-MAINT-6 | Significant/cross-cutting decisions recorded as [ADRs](./decisions/). |
| NFR-MAINT-7 | TypeScript strict mode; lint/format/type-check pass in CI. |

---

## 8. Testability (`NFR-TEST`)

| ID | Requirement |
| --- | --- |
| NFR-TEST-1 | Pure domain logic (stats, achievements, recommendations, migrations) unit-tested. |
| NFR-TEST-2 | TMDB mocked (MSW) for deterministic tests. |
| NFR-TEST-3 | Critical flows (add, rate/review, track show, import/export, offline) covered by E2E. |
| NFR-TEST-4 | Data round-trip (export→import) is a tested invariant. |
Details and tooling: [Testing Strategy](../04-engineering/testing-strategy.md).

---

## 9. Verification
Each NFR is verified by the [Testing Strategy](../04-engineering/testing-strategy.md) (automated where possible) and the relevant design/accessibility checklists, and is re-checked before Version 1.0 is declared complete. Failing an NFR blocks "done" for the affected area ([Quality Over Quantity](../00-overview/product-principles.md)).

---

### Related documents
- [Success Metrics](../00-overview/success-metrics.md) — the product-side UX targets these NFRs mirror
- [Architecture Overview](./architecture-overview.md) — the structure that delivers these properties
- [UX, Accessibility & Motion](../02-design/ux-accessibility-motion.md) — a11y/responsive/motion rules and the contrast gate
- [Testing Strategy](../04-engineering/testing-strategy.md) — how each NFR is verified
- [PRD](../01-product/prd.md) — the functional requirements these support
