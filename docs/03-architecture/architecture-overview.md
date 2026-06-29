---
title: Architecture Overview
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./technical-specifications.md
  - ./data-models.md
  - ./state-and-persistence.md
  - ./tmdb-integration.md
  - ./pwa-and-offline.md
  - ./security-and-privacy.md
  - ./srs.md
  - ./decisions/0000-architecture-philosophy.md
  - ../01-product/prd.md
---

# Architecture Overview

> **Purpose.** This is the map of the WatchVerse system: its layers, the boundaries between them, how server and client state are separated, and the strategy that makes a future backend a contained change. It explains *why* the architecture is shaped this way.
>
> **Owns:** the high-level architecture, layering, dependency rules, and migration strategy.
> **Does not own:** concrete libraries/versions ([Technical Specifications](./technical-specifications.md)); data shapes ([Data Models](./data-models.md)); state/storage mechanics ([State & Persistence](./state-and-persistence.md)); TMDB, PWA, or security specifics (their respective docs); or non-functional requirements ([SRS](./srs.md)).

Every decision here is made through the lens of [ADR-000 — Architecture Philosophy](./decisions/0000-architecture-philosophy.md): prefer maintainability, clarity, predictability, and simplicity over cleverness or abstraction.

---

## 1. Architectural style

**Feature-based modular architecture with a hard data-access boundary (the Repository pattern).**

WatchVerse is, honestly, a CRUD application — and we keep the data layer boringly clean on purpose ([ADR-000](./decisions/0000-architecture-philosophy.md)). The cinematic, non-CRUD *feeling* is delivered entirely in the UI layer, not by over-engineering the core. The architecture optimizes for two things above all: **(1) the user experience never being blocked by data concerns, and (2) replacing local storage with a real backend later without touching the UI.**

---

## 2. The layers

```
┌──────────────────────────────────────────────────────────────┐
│  UI LAYER                                                      │
│  features/*  +  shared/ui (design system)                     │
│  React screens, components, feature hooks                     │
└───────────────────────────────┬──────────────────────────────┘
                                │ calls (hooks)
┌───────────────────────────────▼──────────────────────────────┐
│  APPLICATION / DOMAIN LAYER                                    │
│  • TanStack Query hooks  → SERVER state (TMDB)                 │
│  • Zustand stores        → CLIENT state (user data)           │
│  • domain/ : pure types, Zod schemas, stats, achievements,    │
│              recommendations (no React, no storage)           │
└───────────────────────────────┬──────────────────────────────┘
                                │ depends on interfaces only
┌───────────────────────────────▼──────────────────────────────┐
│  DATA-ACCESS LAYER  (the swap point)                          │
│  • tmdbClient            (external API; never the swap point) │
│  • LibraryRepository     (interface)                          │
│       ├─ LocalStorageLibraryRepository   ← v1.0               │
│       └─ ApiLibraryRepository            ← future backend     │
│  • storage adapter (raw persistence + Zod validation)         │
└──────────────────────────────────────────────────────────────┘
```

### 2.1 UI layer (`features/*`, `shared/ui`)
Vertical feature slices (home, discover, library, …) compose the design-system components from `shared/ui`. Features never reach into each other's internals; cross-feature reuse lives in `shared/`. The UI talks only to the application layer (hooks/stores), never to storage or TMDB directly.

### 2.2 Application / domain layer
- **Server state** (TMDB) is accessed exclusively through **TanStack Query** hooks (`data/tmdb/queries`). It is cacheable, refetchable, and owned by TMDB.
- **Client state** (the user's library, collections, tags, profile, settings) lives in **Zustand** stores that read/write through the Repository.
- **`domain/`** is pure TypeScript — no React, no storage. It holds the canonical types, [Zod](../00-overview/glossary.md#z) schemas, and the pure calculators for statistics, achievements, and recommendations. Because it is pure, it is trivially testable and survives a backend migration untouched.

### 2.3 Data-access layer (the swap point)
- **`tmdbClient`** wraps TMDB; it is *not* the migration boundary (TMDB stays as the catalog source regardless of backend).
- **`LibraryRepository`** is an interface describing every user-data operation (`getEntries`, `upsertEntry`, `removeEntry`, `getCollections`, `export`, `import`, …). The entire app depends on this interface, never on a concrete implementation. **All Repository methods are asynchronous (Promise-based) by design** — even though the LocalStorage implementation completes immediately, consumers must never rely on synchronous behavior, so the persistence engine can change (LocalStorage → IndexedDB → backend) without touching them ([ADR-001](./decisions/0001-repository-pattern.md)).
- v1.0 ships **`LocalStorageLibraryRepository`**. A future backend ships **`ApiLibraryRepository`** implementing the same interface. One provider binding changes; the UI does not. This is the project's migration insurance and the single most important structural decision ([ADR-001](./decisions/0001-repository-pattern.md)).

---

## 3. Separation of server vs. client state

This is the architecture's load-bearing distinction (to be formalized as ADR-002), and conflating the two is the most common way apps like this rot:

| | Server state | Client state |
| --- | --- | --- |
| **Source of truth** | TMDB | The user (on device) |
| **Tool** | TanStack Query | Zustand + Repository |
| **Nature** | Cacheable, refetchable, can be discarded | Durable, must never be lost |
| **Examples** | trending, search, title details, cast, similar | library entries, statuses, ratings, reviews, collections, tags, profile, settings |

Keeping them physically separate means TMDB cache behavior can never corrupt user data, and user data never depends on the network. Details and data-flow diagrams: [State & Persistence](./state-and-persistence.md).

A third kind, **URL state** (search query, filters, sort, view), lives in the router; a fourth, **ephemeral UI state** (modal open, hover), lives in components. Four kinds of state, never mixed.

---

## 4. Dependency rules (enforced conventions)

These keep the architecture honest as it grows (see [Folder Structure](../04-engineering/folder-structure.md)):

1. **`localStorage` appears in exactly one folder** (`data/repository/localStorage`). Grepping for it anywhere else is a defect.
2. **The UI never imports from `data/` directly** — only via application-layer hooks/stores.
3. **`domain/` imports nothing from React, storage, or features.** Dependencies point inward only.
4. **Features never import other features' internals.**
5. **No raw hex/spacing/magic values in components** — only design tokens ([Design System](../02-design/design-system.md)).
6. **TMDB shapes never leak past the data layer** — they are validated and mapped to domain types at the boundary ([TMDB Integration](./tmdb-integration.md)).

---

## 5. Cross-cutting concerns

- **Validation** at every untrusted boundary (TMDB responses, storage reads, imports) via Zod — see [State & Persistence](./state-and-persistence.md) and [Security & Privacy](./security-and-privacy.md).
- **Offline & PWA**: the app shell and local data work offline; only TMDB-backed features require the network — see [PWA & Offline](./pwa-and-offline.md).
- **Observability-ready, observability-absent**: no external telemetry in v1.0, but error/logging seams exist so it can be added without refactor (ADR-008) — see [Security & Privacy](./security-and-privacy.md).
- **Performance**: list virtualization, selector-based store subscriptions, memoized domain calculators, code-split routes — budgets in the [SRS](./srs.md).

---

## 6. Request/data flow examples

**Read (title detail):** UI calls `useTitleDetails(id)` (Query → tmdbClient → Zod-validated → mapped to domain) for facts, and a Zustand selector `useLibraryEntry(id)` for the user's data; the component merges them. Offline, facts come from cache and the user's entry from local storage.

**Write (rate a movie 8.5):** UI calls `libraryStore.setRating(id, 8.5)` → store updates optimistically → Repository persists → domain re-evaluates stats/achievements → activity logged → toast confirms. No network involved. (Full sequence: [State & Persistence](./state-and-persistence.md).)

---

## 7. Why this architecture (and why not more)

- It satisfies the explicit constraint — *make the backend swap easy* — with **exactly one** boundary abstraction (the Repository), per [ADR-000](./decisions/0000-architecture-philosophy.md) rule 3. We deliberately add no further layers.
- It keeps the expensive-to-reverse decisions (data ownership, state separation, validation boundaries) contained and documented.
- It scales to this project's real size (one user, up to a few thousand titles) without platform-grade machinery.
- It is understandable: a new contributor can trace any piece of data from screen to storage in a straight line.

---

## 8. Architectural invariants

These are rules that must **never become false** for the lifetime of WatchVerse — the assumptions future contributors should never accidentally violate. A change that breaks one is not a refactor; it is an architecture change requiring an [ADR](./decisions/).

1. **TMDB data is never persisted as the application's source of truth.** It is cache; the user's `LibraryEntry` snapshot is what is kept ([Data Models](./data-models.md)).
2. **Every user-data mutation eventually passes through the Repository.** No store or component writes persistence directly.
3. **The Repository remains the single persistence boundary**, and `localStorage`/any storage engine appears in exactly one folder.
4. **Repository operations are asynchronous (Promise-based)** regardless of the underlying engine ([ADR-001](./decisions/0001-repository-pattern.md)).
5. **All persisted user data is versioned** (schema version + migrations) ([State & Persistence](./state-and-persistence.md)).
6. **All persisted user data is validated before use** (Zod on every read/import); invalid data is quarantined, never trusted.
7. **Domain logic never imports React** (or storage). `domain/` is pure; dependencies point inward only.
8. **The UI never imports persistence implementations directly** — only application-layer hooks/stores.
9. **Statistics remain derived data, never stored.**
10. **Achievement progress remains derived from user data**, never manually maintained as a separate truth.
11. **Design tokens remain the only source of visual values inside components** ([Design System](../02-design/design-system.md)) — no raw hex/spacing/magic numbers.

If a proposed change requires breaking an invariant, stop: it is an architectural decision, not an implementation detail.

## 9. Error classification (shared vocabulary)

So that implementation, testing, and UX describe failures consistently, WatchVerse recognizes **four high-level error categories**. This establishes shared vocabulary, not implementation detail; concrete handling lives in the owning documents.

| Category | What it is | Typical sources | Handling principle |
| --- | --- | --- | --- |
| **Validation Errors** | Data fails a schema/shape/constraint check | TMDB responses, storage reads, import files ([Zod](../00-overview/glossary.md#z) boundaries) | Reject/quarantine the bad data; never trust or crash; surface recoverably ([Security & Privacy](./security-and-privacy.md)) |
| **Network Errors** | A required network operation cannot complete | TMDB unreachable, offline, rate-limited/timeout | Friendly offline/retry state; local data stays usable ([TMDB Integration](./tmdb-integration.md), [PWA & Offline](./pwa-and-offline.md)) |
| **Recoverable User Errors** | The user did something the system can gently correct | invalid form input, exceeding the 500-char review limit, conflicting/duplicate action | Inline guidance; prevent or explain; never punish ([Functional Specifications](../01-product/functional-specifications.md)) |
| **Unexpected Internal Errors** | An unanticipated failure/bug | logic errors, unexpected exceptions | Caught by an error boundary; friendly fallback UI; routed to the (currently unwired) observability seam ([Security & Privacy](./security-and-privacy.md)) — never a raw crash or stack trace shown to the user |

All four are presented through the **four-state contract** ([Functional Specifications §1.1](../01-product/functional-specifications.md)) — calm, recoverable, never a generic error screen. Later documents (testing, implementation, UX copy) reference these category names rather than inventing their own.

---

### Related documents
- [ADR-000 — Architecture Philosophy](./decisions/0000-architecture-philosophy.md) — the lens for all of the above
- [ADR-001 — Repository Pattern](./decisions/0001-repository-pattern.md) — the persistence boundary and async contract
- [Technical Specifications](./technical-specifications.md) — the concrete stack realizing these layers
- [Data Models](./data-models.md) · [State & Persistence](./state-and-persistence.md) — the domain and its movement
- [TMDB Integration](./tmdb-integration.md) · [PWA & Offline](./pwa-and-offline.md) · [Security & Privacy](./security-and-privacy.md)
- [SRS](./srs.md) — the non-functional requirements this architecture must meet
