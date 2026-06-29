---
title: ADR-001 — Repository Pattern as the Single Persistence Boundary (async-by-default)
status: Accepted
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture/decisions
supersedes: none
superseded-by: none
related:
  - ./0000-architecture-philosophy.md
  - ../architecture-overview.md
  - ../state-and-persistence.md
  - ../data-models.md
---

# ADR-001 — Repository Pattern as the Single Persistence Boundary (async-by-default)

> **Status:** Accepted
> **Date:** 2026-06-27

## Context
WatchVerse is [local-first](../../00-overview/glossary.md#l): in v1.0 all user data is persisted on-device via LocalStorage. A stated, first-class project goal is the ability to **replace LocalStorage with a real backend later while minimizing changes throughout the rest of the application** — and, along the way, to allow IndexedDB as a drop-in storage engine if the storage budget ever demands it ([State & Persistence §5.5](../state-and-persistence.md)).

This is precisely the kind of expensive-to-reverse, project-protecting boundary that [ADR-000](./0000-architecture-philosophy.md) permits an abstraction for (rule 3: "abstract only with evidence … exception: deliberately chosen boundary abstractions justified by an explicit, documented future need").

## Decision
**All user-data persistence flows through a single interface, `LibraryRepository`. The entire application depends on this interface, never on a concrete implementation, and `localStorage` (or any storage engine) appears in exactly one folder.**

Additionally: **the `LibraryRepository` interface is asynchronous (Promise-based) by design.** Every operation conceptually returns a `Promise`, even though the v1.0 LocalStorage implementation completes synchronously/immediately. **Consumers must never depend on synchronous behavior.**

- v1.0 implementation: `LocalStorageLibraryRepository`.
- Future implementations: `ApiLibraryRepository` (backend), and/or an IndexedDB-backed repository — each implementing the same async interface, swapped via a single provider binding.

## Principles served
- [ADR-000](./0000-architecture-philosophy.md): a justified boundary abstraction that maximizes long-term maintainability, predictability, and reversibility.
- Product principle **Build For Tomorrow**: anticipates growth at the boundary, not in the interior.
- Product principle **Your Data Is Sacred**: a single persistence boundary is also the single place to enforce validation, versioning, and migration.

## Why async-by-default (the key refinement)
Designing the contract as synchronous "because LocalStorage is synchronous" would leak an implementation detail into every consumer. The moment persistence became async (a network backend, or IndexedDB — both inherently async), every call site and any dependent UI would have to change. Making the contract async from day one means:
- **Backend migration requires no API changes** — `ApiLibraryRepository` is naturally async.
- **IndexedDB becomes a drop-in** persistence implementation if ever needed.
- **Async workflows are consistent** across the app (loading/pending handling is uniform).
- **UI never changes** merely because the persistence mechanism changed.

The cost is negligible: LocalStorage operations simply resolve immediately. This is an abstraction that clearly protects the architecture — exactly the kind ADR-000 endorses.

## Alternatives considered
- **Synchronous Repository interface (match LocalStorage) —** rejected. Cheaper today, but converts a future storage change into an app-wide refactor; violates reversibility and predictability.
- **No repository; stores call `localStorage` directly —** rejected. Scatters persistence, makes the backend swap a rewrite, and removes the single point to enforce validation/versioning/migration.
- **A heavier data-layer (unit-of-work, ORM-like, caching repository) —** rejected as over-engineering for this project's size ([ADR-000](./0000-architecture-philosophy.md) rule 4). One clean async interface is sufficient.

## Consequences
- **Positive:** backend/IndexedDB migration is "implement the interface + bind it" rather than a rewrite; one enforcement point for validation/versioning/migration; `localStorage` confined to one folder (lint-enforceable).
- **Negative / costs:** consumers must handle Promises even where v1.0 resolves instantly; a tiny amount of async ceremony in otherwise-synchronous local operations.
- **Follow-ups:** the Repository is an [Architectural Invariant](../architecture-overview.md) — it must remain the single persistence boundary for the lifetime of the project.

## References
- [Architecture Overview](../architecture-overview.md) — the layer this boundary defines, plus the Architectural Invariants
- [State & Persistence](../state-and-persistence.md) — how the interface is implemented and the IndexedDB escape hatch
- [Data Models](../data-models.md) — the entities the Repository persists
