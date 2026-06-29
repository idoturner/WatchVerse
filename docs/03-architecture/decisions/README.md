---
title: Architecture Decision Records (ADRs)
status: Living
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture/decisions
related:
  - ../architecture-overview.md
  - ../../00-overview/product-principles.md
  - ../../../CONTRIBUTING.md
---

# Architecture Decision Records (ADRs)

> **Purpose.** This folder records significant architectural and cross-cutting decisions for WatchVerse — one decision per file. ADRs are how the project evolves **within stable boundaries**: instead of silently editing approved documentation, a new ADR captures a change, its reasoning, and what it supersedes, preserving a traceable history.
>
> **Owns:** the record and reasoning of significant decisions over time.
> **Does not own:** the current-state specification of any topic — that always lives in the relevant owning document (e.g. [data-models.md](../data-models.md)). An ADR explains *why*; the owning doc states *what is true now*.

This is a **Living** document (the index); individual ADRs are immutable once `Accepted` — they are superseded, never edited away.

---

## When to write an ADR
Write one when a decision is **significant and cross-cutting**: it shapes structure, is expensive to reverse, affects multiple features, or changes a previously-approved decision. Routine, local choices do not need an ADR. See [CONTRIBUTING](../../../CONTRIBUTING.md) for the workflow.

## ADR lifecycle (status values)
- **Proposed** — drafted, under review.
- **Accepted** — approved and in force.
- **Superseded by ADR-NNN** — replaced by a later decision (kept for history).
- **Deprecated** — no longer relevant, not replaced.

## How to add one
1. Copy [`template.md`](./template.md) to `NNNN-short-title.md` (next number, zero-padded).
2. Fill in context, decision, alternatives, and consequences.
3. Reference the [Product Principles](../../00-overview/product-principles.md) the decision serves and link the owning document(s).
4. Add a row to the index below and a [changelog](../../05-delivery/changelog.md) entry.

---

## Index

| ADR | Title | Status | Summary |
| --- | --- | --- | --- |
| [000](./0000-architecture-philosophy.md) | Architecture Philosophy | Accepted | The guiding principle for all architectural decisions: prefer maintainability, clarity, predictability, and simplicity over cleverness or abstraction. |
| [001](./0001-repository-pattern.md) | Repository Pattern — single persistence boundary (async-by-default) | Accepted | The entire app reads/writes user data through one **asynchronous** `LibraryRepository` interface; LocalStorage today, IndexedDB or a backend later, with no UI changes. |

### Decision backlog (already made elsewhere; to be formalized as ADRs)
The following decisions are already documented and reasoned in their owning documents and are binding. They will be promoted to individual ADRs (001+) as the architecture documents are finalized, so each has a dedicated, immutable record:

| Planned ADR | Decision | Currently documented in |
| --- | --- | --- |
| 002 | Separation of server state (TanStack Query) from client state (Zustand) | [state-and-persistence.md](../state-and-persistence.md) |
| 003 | Local-first storage on LocalStorage for v1.0, with IndexedDB as the escape hatch | [state-and-persistence.md](../state-and-persistence.md) |
| 004 | PWA from day one (installable, offline app shell) | [pwa-and-offline.md](../pwa-and-offline.md) |
| 005 | Two media types only (Movie, TV Show); "anime" as a TMDB Discover category | [data-models.md](../data-models.md), [tmdb-integration.md](../tmdb-integration.md) |
| 006 | Season-level TV tracking for v1.0, designed to extend to per-episode later | [data-models.md](../data-models.md) |
| 007 | Import default = Merge (Replace as deliberate secondary) | [../../01-product/functional-specifications.md](../../01-product/functional-specifications.md) |
| 008 | No external observability in v1.0; architecture kept observability-ready | [security-and-privacy.md](../security-and-privacy.md) |

> These are listed for traceability. Promoting one to a full ADR does not change the decision; it gives the decision a permanent home.

---

### Related documents
- [Architecture Overview](../architecture-overview.md) — the architecture these decisions shape
- [Product Principles](../../00-overview/product-principles.md) — the values decisions are weighed against
- [CONTRIBUTING](../../../CONTRIBUTING.md) — the documentation/decision workflow
- [Changelog](../../05-delivery/changelog.md) — where decision/revision history is summarized
