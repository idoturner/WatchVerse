---
title: State & Persistence
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./architecture-overview.md
  - ./data-models.md
  - ./tmdb-integration.md
  - ../01-product/functional-specifications.md
  - ./decisions/0000-architecture-philosophy.md
---

# State & Persistence

> **Purpose.** This document specifies how state is managed and how user data is persisted: the four kinds of state and their tools, the data-flow patterns, and the complete LocalStorage architecture (namespaces, versioning, migrations, validation, batching, and the IndexedDB escape hatch).
>
> **Owns:** state-management strategy and the persistence/storage mechanics.
> **Does not own:** the data shapes ([Data Models](./data-models.md)); the architecture's layers ([Architecture Overview](./architecture-overview.md)); or TMDB caching specifics ([TMDB Integration](./tmdb-integration.md)).

---

## 1. Four kinds of state (never mixed)

| Kind | Owner | Tool | Persisted? | Examples |
| --- | --- | --- | --- | --- |
| **Server state** | TMDB | TanStack Query | In Query cache (ephemeral) | trending, search, details, cast, similar |
| **Client state** | The user | Zustand + Repository | Yes (durable) | library, statuses, ratings, reviews, collections, tags, profile, settings, activity, achievements, search history |
| **URL state** | The route | React Router params | In URL | search query, filters, sort, view toggle |
| **Ephemeral UI** | Component | `useState`/`useReducer` | No | modal open, hover, form draft |

This separation (ADR-002) is the load-bearing decision: TMDB cache behavior can never corrupt durable user data, and user data never depends on the network.

---

## 2. Server state — TanStack Query
- All TMDB access is via Query hooks (`data/tmdb/queries`); components never call `tmdbClient` directly.
- **Defaults:** sensible `staleTime` (catalog data changes slowly), background refetch, retry with backoff, request de-dup and cancellation. `networkMode` tuned so cached data is served offline and mutations to user data never block on network ([PWA & Offline](./pwa-and-offline.md)).
- **Never persisted as truth:** TMDB responses are cache only. What the user *keeps* about a title is the `LibraryEntry` snapshot ([Data Models](./data-models.md)), not the TMDB blob.
- Query keys are centralized in `config/` for consistency.

---

## 3. Client state — Zustand + Repository

### 3.1 Stores
`libraryStore`, `collectionsStore`, `tagsStore`, `profileStore`, `settingsStore`. Stores:
- expose **actions, not setters** (`markCompleted(id)`, not `setStatus`) so business rules live in one place;
- subscribe via **selectors** to avoid re-render storms at 1,000+ titles ([SRS](./srs.md));
- hold the in-memory copy for fast reads and **delegate all durability to the Repository**.

### 3.2 The Repository boundary
Stores never touch `localStorage`; they call the [`LibraryRepository`](./architecture-overview.md) interface. v1.0 = `LocalStorageLibraryRepository`; future = `ApiLibraryRepository`. **Repository methods are asynchronous (Promise-based) by default**, so the persistence engine can change (LocalStorage → IndexedDB → backend) without touching consumers — even though the LocalStorage implementation resolves immediately. This is the migration insurance ([ADR-001](./decisions/0001-repository-pattern.md)) and the reason `localStorage` appears in exactly one folder.

### 3.3 Hydration
On app start, stores hydrate from the Repository: read → Zod-validate → migrate if needed → populate. A hydration failure surfaces a recoverable state, never a crash ([FS §1.6](../01-product/functional-specifications.md)).

---

## 4. Data-flow patterns

**Optimistic write (rate 8.5):**
```
UI → libraryStore.setRating(id, 8.5)
   → store updates in-memory immediately (optimistic; UI reflects instantly)
   → repository.upsertEntry(updated)  → persists (debounced/batched)
   → domain recomputes stats; achievement engine evaluates (may unlock)
   → activity appended (ring buffer)
   → toast confirms
If persistence fails (e.g. quota): roll back optimistic change, keep user input,
   surface a recoverable error (§7).
```

**Read (title detail):** `useTitleDetails(id)` (server) + `useLibraryEntry(id)` selector (client) → component merges. Offline: facts from cache, entry from storage.

**Derived data:** statistics/recommendations are computed by pure `domain/` functions from client state, memoized — never stored ([Data Models §6](./data-models.md)).

---

## 5. LocalStorage architecture

### 5.1 Namespaces (keys)
All keys are versioned under a single prefix (ADR-003):

```
watchverse:v1:entries        → Record<id, LibraryEntry>
watchverse:v1:collections    → Record<id, Collection>
watchverse:v1:tags           → Record<id, Tag>
watchverse:v1:profile        → Profile
watchverse:v1:settings        → Settings          (separate from content)
watchverse:v1:activity       → Activity[]          (capped ring buffer ~500)
watchverse:v1:achievements   → Record<achievementId, AchievementRecord>
watchverse:v1:searchHistory  → SearchHistoryItem[] (capped ~10–15)
watchverse:v1:meta           → { schemaVersion, lastBackupAt }
```

Data is stored as **normalized keyed maps**, mirroring relational tables ([Data Models](./data-models.md)).

### 5.2 Schema versioning & migrations
- `meta.schemaVersion` records the data version. On load, a **migration runner** (`data/repository/localStorage/migrations.ts`) applies ordered migrations from the stored version to the current one.
- Migrations are pure, tested functions. We *will* change shapes; this is how we never lose data doing so ([Your Data Is Sacred](../00-overview/product-principles.md)).
- The same versioning governs the export file ([Data Models §8](./data-models.md)).

### 5.3 Validation on read (untrusted input)
LocalStorage is untrusted (corruption, manual edits, older/newer app versions). Every read is **parse → Zod-validate → migrate → use**. On validation failure, the affected slice is **quarantined** (preserved, not overwritten) and surfaced as a recoverable error; good data is never destroyed by bad ([FS §1.6](../01-product/functional-specifications.md)).

### 5.4 Write strategy
- Writes are **debounced/batched** (e.g. on idle/blur) so high-frequency input (typing a review) does not thrash synchronous storage and jank the UI.
- Writes are **atomic per namespace**; a failed write rolls back the optimistic in-memory change.

### 5.5 Storage budget & the IndexedDB escape hatch
- LocalStorage (~5 MB) is ample for the v1.0 model: entries are small (references + user fields, not TMDB blobs), activity is capped, and TV is season-level — the per-episode data that would dominate the budget is deliberately deferred ([Data Models §4](./data-models.md)).
- If the budget is ever approached (e.g. when per-episode tracking arrives), **IndexedDB** (via a thin wrapper) is the upgrade path. Because all persistence goes through the Repository/storage adapter, swapping the engine is a contained change — no UI or store changes (ADR-003).

---

## 6. Settings vs. content separation
`settings` (and `searchHistory`) are **device preferences**, kept in their own namespaces, separate from library content. This means a future backend can sync the user's library across devices while leaving device-local preferences local — exactly the intended boundary ([Data Models §6](./data-models.md)).

---

## 7. Failure & integrity guarantees
- No app-caused unrecoverable data loss ([M15](../00-overview/success-metrics.md)): optimistic rollback, quarantine-on-corruption, confirm/undo on destructive actions ([FS §1.4](../01-product/functional-specifications.md)), and always-available export.
- Quota-exceeded and serialization errors are handled gracefully with recoverable messaging, never a crash.

---

### Related documents
- [Data Models](./data-models.md) — the shapes stored here
- [Architecture Overview](./architecture-overview.md) — the Repository boundary and state separation
- [TMDB Integration](./tmdb-integration.md) — server-state caching specifics
- [PWA & Offline](./pwa-and-offline.md) — offline behavior of state and persistence
- [Functional Specifications](../01-product/functional-specifications.md) — optimistic updates, validation, undo behavior
