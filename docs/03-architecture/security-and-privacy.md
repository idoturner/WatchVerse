---
title: Security & Privacy
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./architecture-overview.md
  - ./tmdb-integration.md
  - ./state-and-persistence.md
  - ../00-overview/product-principles.md
  - ../00-overview/anti-goals.md
---

# Security & Privacy

> **Purpose.** This document defines WatchVerse's security and privacy posture: local-first data ownership, the TMDB-credential reality and its mitigation, the no-telemetry-in-v1.0 stance (kept observability-ready), input-validation and dependency posture, and the user's data rights. It is what makes ["Your Data Is Sacred"](../00-overview/product-principles.md) credible rather than a slogan.
>
> **Owns:** the security & privacy stance and its rationale.
> **Does not own:** storage mechanics ([State & Persistence](./state-and-persistence.md)) or TMDB integration specifics ([TMDB Integration](./tmdb-integration.md)) beyond the security framing.

---

## 1. Privacy posture: local-first by default
- **All user data stays on the user's device** in v1.0. There is **no WatchVerse backend, no account, and no transmission of user data** — library, reviews, ratings, collections, tags, activity, and search history never leave the device ([PRD-SYS-9](../01-product/prd.md), [Anti-Goals](../00-overview/anti-goals.md)).
- The only network calls are to **TMDB** (catalog data + images) and to fetch **self-hosted static assets** (no third-party CDNs/fonts/trackers) — minimizing the app's external footprint.
- **Search history** and reviews are explicitly private and local ([PRD-HIST-4](../01-product/prd.md), [PRD-REV-4](../01-product/prd.md)).

This is a deliberate privacy *feature*, not merely an MVP shortcut.

---

## 2. The TMDB credential (honest treatment)
- A client-only app **cannot truly hide** an API credential shipped to the browser. We do not pretend otherwise.
- **v1.0 mitigation:** use a **read-scoped** TMDB credential (no write capability), supplied via environment configuration ([Technical Specifications §4](./technical-specifications.md)); accept that it is visible in network requests.
- **Future mitigation (Phase 10):** when a backend is introduced, a **thin proxy** can hold the credential server-side and add rate-limit protection; the client then talks to our proxy. The [Repository](./architecture-overview.md)/`tmdbClient` boundary means this is a contained change.
- This trade-off is recorded so it is a *known, accepted* risk, not an oversight.

---

## 3. Observability: absent in v1.0, ready for later (ADR-008)
- **No external analytics, error tracking, or monitoring** ships in v1.0 — the project is fully self-contained ([Anti-Goals](../00-overview/anti-goals.md)).
- The architecture is nonetheless **observability-ready**: a single, swappable error/logging seam exists (e.g. a `reportError` boundary) so a tool like Sentry — or privacy-respecting, opt-in analytics — can be added later **without refactoring** features. Nothing is wired to it now.
- If telemetry is ever added, it will be **opt-in and privacy-respecting**, decided deliberately (and recorded as an ADR), consistent with §1.

---

## 4. Input validation & integrity (defense in depth)
- **All untrusted input is validated** with [Zod](../00-overview/glossary.md#z): TMDB responses ([TMDB Integration](./tmdb-integration.md)), every read from storage, and every import file ([State & Persistence](./state-and-persistence.md)).
- **Imports** are treated as untrusted: validated and migrated before applying; invalid/corrupt files are rejected with **no mutation** of existing data ([PRD-DATA-4](../01-product/prd.md)).
- **Storage corruption** is quarantined, never trusted or allowed to crash the app ([FS §1.6](../01-product/functional-specifications.md)).
- **XSS surface:** React escapes by default; user free-text (reviews) is rendered as text, never as HTML; no `dangerouslySetInnerHTML` on user or TMDB content.

---

## 5. Dependency & supply-chain posture
- Prefer **few, well-supported** dependencies ([ADR-000](./decisions/0000-architecture-philosophy.md)); each new one is weighed for maintenance and trust ([Technical Specifications §6](./technical-specifications.md)).
- Versions pinned via lockfile; dependency audits run in CI ([Testing Strategy](../04-engineering/testing-strategy.md)).
- **Self-hosted fonts/assets** reduce third-party exposure.

---

## 6. Content security & transport
- Served over **HTTPS** (also required for the PWA).
- A **Content-Security-Policy** is applied, scoped to self + TMDB image/api origins, to reduce injection risk. (Exact policy finalized at deployment; recorded in the deploy config.)
- No third-party script includes.

---

## 7. The user's data rights
Concrete expressions of "Your Data Is Sacred" ([Product Principles](../00-overview/product-principles.md)):
- **Portability:** one-click **export** of all data to a portable JSON file at any time ([PRD-DATA-1](../01-product/prd.md)).
- **Deletion:** **clear-all-data** with strong confirmation; item-level deletes are confirmable/undoable ([PRD-SET-11](../01-product/prd.md), [FS §1.4](../01-product/functional-specifications.md)).
- **No lock-in:** because data is local and exportable in a documented, versioned format ([Data Models §8](./data-models.md)), the user is never trapped.
- **No surprise sharing:** nothing is published or transmitted without an explicit, deliberate action (and v1.0 has no sharing at all).

---

## 8. Threat model (scope)
For a local-first, account-less client app, the realistic risks and responses:

| Risk | Response |
| --- | --- |
| API credential exposure | Read-scoped key; future proxy (§2) |
| Malformed TMDB/import/storage data | Zod validation + quarantine (§4) |
| XSS via user/TMDB content | React escaping; no raw HTML (§4) |
| Data loss (app-caused) | Undo/confirm, validation, export ([State & Persistence §7](./state-and-persistence.md)) |
| Data loss (device/browser-level) | Outside app control; mitigated by user-facing export (§7) |
| Third-party tracking | None shipped; self-hosted assets (§1) |

Out of scope (no backend/accounts in v1.0): server auth, multi-tenant authorization, server-side injection.

---

### Related documents
- [Product Principles — Your Data Is Sacred](../00-overview/product-principles.md) — the value this stance upholds
- [State & Persistence](./state-and-persistence.md) — validation, quarantine, export mechanics
- [TMDB Integration](./tmdb-integration.md) — the credential and attribution
- [Technical Specifications](./technical-specifications.md) — env config, deployment, dependencies
- [Anti-Goals](../00-overview/anti-goals.md) — no ads, no tracking, no account-gating
