---
title: Data Models
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./architecture-overview.md
  - ./state-and-persistence.md
  - ./tmdb-integration.md
  - ../01-product/prd.md
  - ../01-product/functional-specifications.md
  - ../00-overview/glossary.md
---

# Data Models

> **Purpose.** This document defines the canonical domain models of WatchVerse — the shapes of the user's data, their relationships, identity, and timestamps — plus the export-file shape. It is the data contract every other layer agrees on, and the preview of a future backend schema.
>
> **Owns:** domain entity shapes, relationships, ID/timestamp conventions, enums, and the export format.
> **Does not own:** how data is stored/migrated/validated at runtime ([State & Persistence](./state-and-persistence.md)); TMDB's own shapes ([TMDB Integration](./tmdb-integration.md)); or behavior/validation rules ([Functional Specifications](../01-product/functional-specifications.md)).

Notation is illustrative TypeScript-like pseudocode for clarity; the authoritative runtime definition is the [Zod](../00-overview/glossary.md#z) schemas in `domain/schemas.ts`, from which the TypeScript types are derived (single source of truth, per [ADR-000](./decisions/0000-architecture-philosophy.md)). Field names are indicative.

---

## 1. Modeling principles

1. **Store references, not copies.** A user entity references a TMDB title by id + media type and keeps a *small snapshot* (title, poster path, year) for offline/instant rendering — never the full TMDB payload. Keeps storage small and avoids stale duplication.
2. **User data is separate from TMDB data.** A `LibraryEntry` (what the *user* recorded) is distinct from a `TmdbTitle` (what TMDB knows). The UI composes them; the store never persists TMDB facts as truth.
3. **Stable, opaque IDs.** Every entity has a string id (`nanoid`), never an array index, so references survive reordering and sync.
4. **Timestamps everywhere.** Every user entity has `createdAt` and `updatedAt` (ISO 8601). These power activity, sorting, and — critically — **merge conflict resolution** on import and future sync (most-recently-updated wins; [FS §12.2](../01-product/functional-specifications.md)).
5. **Normalized, flat collections.** Entities are stored as keyed maps, referencing each other by id — relational in spirit, so the model transfers directly to a backend.
6. **Two media types only.** `movie | tv`. "Anime" is a discovery category, not a type (ADR-005, [TMDB Integration](./tmdb-integration.md)).

---

## 2. Enums

```
WatchStatus = 'want' | 'watching' | 'completed' | 'on_hold' | 'dropped'
MediaType   = 'movie' | 'tv'
ActivityType =
  'added' | 'status_changed' | 'completed_show' | 'rated' |
  'reviewed' | 'collection_created' | 'achievement_unlocked'
```

`WatchStatus` is the canonical set of five ([PRD-LIB-2](../01-product/prd.md)); the design status colors/icons map one-to-one ([Design System §2.3](../02-design/design-system.md)).

---

## 3. Core entity: `LibraryEntry`

The heart of the model — one per tracked title.

```
LibraryEntry {
  id: string                 // nanoid (entry identity)
  tmdbId: number             // TMDB id
  mediaType: MediaType       // 'movie' | 'tv'

  // small denormalized snapshot (for offline/instant render — NOT source of truth)
  snapshot: {
    title: string
    posterPath: string | null
    releaseYear: number | null
  }

  status: WatchStatus
  rating: number | null      // 0.5–10.0 in 0.5 steps, or null (unrated)
  review: string | null      // optional, plain text, ≤500 chars (the Review)
  watchedAt: string | null   // ISO date the user watched/completed (editable)
  rewatchCount: number       // ≥0

  tv: TvProgress | null       // present only when mediaType === 'tv' (see §4)

  collectionIds: string[]    // references → Collection.id
  tagIds: string[]           // references → Tag.id

  createdAt: string          // ISO 8601
  updatedAt: string          // ISO 8601
}
```

Notes:
- `review` is the single canonical free-text field (there is no separate "note", per the approved [Glossary](../00-overview/glossary.md#r)).
- `collectionIds`/`tagIds` are the entry's side of a many-to-many; collections/tags do not duplicate entry data.
- `rating: null` means unrated (distinct from 0). Clearing a rating sets it back to null ([PRD-RATE-4](../01-product/prd.md)).

---

## 4. TV season tracking: `TvProgress` (episode-ready)

v1.0 tracks TV at the **season** level (ADR-006). The shape is deliberately structured so a future per-episode layer attaches **beneath** seasons without altering existing data ([PRD-DET-TV-5](../01-product/prd.md)).

```
TvProgress {
  currentSeason: number | null   // the season the user is on
  completedSeasons: number[]     // season numbers fully watched
  isShowCompleted: boolean       // whole-show completion (feeds stats)

  // FORWARD-COMPATIBILITY SEAM (unused in v1.0, reserved):
  // episodes?: Record<seasonNumber, { watchedEpisodes: number[] }>
}
```

When per-episode tracking is added later, the optional `episodes` map is populated; v1.0 records remain valid because the field is additive and optional. This is exactly the kind of deliberately-justified forward seam permitted by [ADR-000](./decisions/0000-architecture-philosophy.md) rule 3.

---

## 5. Organization entities

```
Collection {
  id: string                 // nanoid
  name: string               // required, trimmed, non-empty
  createdAt: string
  updatedAt: string
  // membership is via LibraryEntry.collectionIds (no duplicated entry data)
}

Tag {
  id: string                 // nanoid
  name: string               // required, trimmed, non-empty
  createdAt: string
  updatedAt: string
  // membership is via LibraryEntry.tagIds
}
```

Membership is intentionally stored on the `LibraryEntry` side (its `collectionIds`/`tagIds`). A collection/tag is a lightweight named record; removing one never deletes titles ([PRD-COLL-5](../01-product/prd.md)).

---

## 6. Profile, Settings, Activity, Achievements, Search History

```
Profile {
  displayName: string
  createdAt: string
  updatedAt: string
}

Settings {                     // device preferences — stored SEPARATELY from library
  defaultView: 'grid' | 'list'
  defaultSort: SortKey
  posterDensity: 'comfortable' | 'compact'
  reducedMotion: 'system' | 'on' | 'off'   // default 'system'
  theme: 'cinema-dark'                       // future-ready; only value in v1.0
  defaultLanding: 'home' | 'library' | 'dashboard'
  confirmBeforeDelete: boolean               // default true
  autoplayTrailers: boolean
  spoilerProtection: boolean
  contentLanguage: string                    // BCP-47, default 'en-US'
  updatedAt: string
}

Activity {
  id: string
  type: ActivityType
  refId: string | null         // related entity (entry/collection/achievement)
  label: string                // human-readable, precomputed
  createdAt: string
}

AchievementRecord {            // unlock state only; definitions are static config
  achievementId: string        // → declarative catalog in domain/achievements
  unlockedAt: string
}

SearchHistoryItem {
  query: string
  createdAt: string
}
```

Notes:
- **Settings live in their own namespace**, separate from library data, so device preferences and user content evolve and (future) sync independently ([PRD-SET](../01-product/prd.md), [State & Persistence](./state-and-persistence.md)).
- **Achievements are declarative**: the *catalog* (id, title, description, icon, rule) is static code in `domain/achievements`; only *unlock state* is user data ([PRD-ACH-2](../01-product/prd.md)).
- **Activity** is a bounded ring buffer (cap ~500) and stores a precomputed `label` so rendering needs no lookups ([PRD-ACT-3](../01-product/prd.md)).
- **Statistics are NOT stored** — they are derived by pure functions from the library at read time (`domain/stats`), per [FS §10.1](../01-product/functional-specifications.md). Storing them would create a second source of truth.

---

## 7. Relationships (summary)

```
LibraryEntry ──many-to-many──> Collection      (via LibraryEntry.collectionIds)
LibraryEntry ──many-to-many──> Tag             (via LibraryEntry.tagIds)
LibraryEntry ──1-to-1 (tv)──>  TvProgress      (embedded)
Activity ──references──>        any entity      (via refId)
AchievementRecord ──references→ static catalog  (via achievementId)
Statistics ──derived-from──>    all LibraryEntries (computed, not stored)
```

This is a small relational schema. A backend would map `LibraryEntry`, `Collection`, `Tag` to tables with join tables for membership — the mental model is identical, which is the point.

---

## 8. Export format (`WatchVerseExport`)

The import/export file ([PRD-DATA](../01-product/prd.md)) and the future cloud-sync payload share this versioned shape:

```
WatchVerseExport {
  schemaVersion: number        // matches storage schema version
  exportedAt: string           // ISO 8601
  appVersion: string
  data: {
    entries: LibraryEntry[]
    collections: Collection[]
    tags: Tag[]
    profile: Profile
    settings: Settings
    activity: Activity[]
    achievements: AchievementRecord[]
    searchHistory: SearchHistoryItem[]
  }
}
```

- `schemaVersion` drives forward migration on import ([State & Persistence](./state-and-persistence.md)).
- **Merge** import reconciles per-entity by `updatedAt` (most recent wins); **Replace** swaps wholesale ([FS §12.2](../01-product/functional-specifications.md)).
- Export → import on a fresh profile must reproduce the library faithfully (tested invariant, [Testing Strategy](../04-engineering/testing-strategy.md)).

---

## 9. Identity, time, and validation
- **IDs:** `nanoid` strings, generated at creation, never reused.
- **Timestamps:** ISO 8601 UTC; `createdAt` immutable, `updatedAt` set on every mutation.
- **Validation:** every shape above has a corresponding Zod schema; all reads from storage and all imports are parsed/validated/migrated before use ([State & Persistence](./state-and-persistence.md)). Invalid data is quarantined, never trusted.

---

## 10. Backend-readiness checklist (baked into these models)
- [x] Stable opaque IDs (not indexes)
- [x] `createdAt`/`updatedAt` on every user entity (sync/merge ready)
- [x] References, not copies (no duplicated TMDB payloads)
- [x] Normalized, flat collections (table-like)
- [x] Versioned, self-describing export = future sync payload
- [x] Settings separated from content
These properties make the backend migration "implement `ApiLibraryRepository` + one-time sync," not a remodel (ADR-001).

---

### Related documents
- [Architecture Overview](./architecture-overview.md) — where these models sit in the system
- [State & Persistence](./state-and-persistence.md) — how these models are stored, versioned, migrated, validated
- [TMDB Integration](./tmdb-integration.md) — the `TmdbTitle` shapes these are kept separate from
- [Functional Specifications](../01-product/functional-specifications.md) — behavior/validation rules over these models
- [PRD](../01-product/prd.md) — the requirements these models serve
