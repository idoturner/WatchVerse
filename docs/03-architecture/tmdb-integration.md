---
title: TMDB Integration
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./architecture-overview.md
  - ./data-models.md
  - ./state-and-persistence.md
  - ./security-and-privacy.md
  - ../01-product/prd.md
---

# TMDB Integration

> **Purpose.** This document specifies how WatchVerse consumes [TMDB](../00-overview/glossary.md#t): the client boundary, response validation and mapping, caching and rate-limit handling, image sizing, error mapping, the "anime" discovery query, and the required legal attribution.
>
> **Owns:** everything about the TMDB integration.
> **Does not own:** general server-state caching strategy ([State & Persistence](./state-and-persistence.md)); domain shapes ([Data Models](./data-models.md)); or the API-key security stance beyond a pointer ([Security & Privacy](./security-and-privacy.md)).

---

## 1. The boundary (TMDB shapes never leak inward)

```
tmdbClient ──fetch──> TMDB
   │ raw JSON
   ▼
tmdb.schemas.ts  (Zod) ── validate ──> typed TMDB DTO
   ▼
tmdb.mappers.ts  ── map ──> domain types (TmdbTitle, etc.)
   ▼
data/tmdb/queries/*  (TanStack Query hooks) ──> UI
```

- `tmdbClient` is the only code that knows TMDB URLs/auth.
- Every response is **Zod-validated** at the boundary; malformed data is rejected as a recoverable error, never trusted ([ADR-000](./decisions/0000-architecture-philosophy.md), [Security & Privacy](./security-and-privacy.md)).
- **Mappers** convert TMDB DTOs into our domain shapes so TMDB schema changes are contained to this folder and never ripple into features or stored data ([Architecture Overview §4](./architecture-overview.md)).

---

## 2. Endpoints used (v1.0)
Mapped to features ([PRD](../01-product/prd.md)):
- **Trending / Popular / Upcoming / Now-Playing** → Home rails (`HOME`).
- **Search (multi / movie / tv)** → search (`SRCH`, `GLOB`).
- **Discover (movie & tv)** → filtered search and the **Anime** rail (§5).
- **Details** (movie/tv) incl. **append_to_response** for `credits` (cast + director), `videos` (trailer), `similar`/`recommendations` → detail pages (`DET`, `DET-TV`, `REC`).
- **Genres** → genre filters.
- **Configuration** (image base URLs/sizes) → image building (§4).

Requests carry the user's **content language/region** preference (`Settings.contentLanguage`, default `en-US`; [Data Models §6](./data-models.md)).

---

## 3. Caching & rate limits
- Handled by **TanStack Query** ([State & Persistence §2](./state-and-persistence.md)): catalog data uses a generous `staleTime`; details/search are cached and de-duplicated; in-flight requests are cancelled on input change.
- **Rate-limit resilience:** retry with exponential backoff on transient/429 responses; surface a calm recoverable error if exhausted. Caching plus debounced search keeps request volume low.
- **Offline:** cached responses serve where available; uncached TMDB needs show the offline state ([PWA & Offline](./pwa-and-offline.md)).

---

## 4. Images
- TMDB serves images at multiple widths. WatchVerse selects the **right size per context and viewport** (poster grids vs. detail backdrops) using `srcset`/appropriate width params — never shipping desktop backdrops to phones ([UX, Accessibility & Motion §1.4](../02-design/ux-accessibility-motion.md)).
- Poster aspect (2:3) is **always preserved**; missing artwork uses an on-brand placeholder ([Design System §9.1](../02-design/design-system.md)).
- Image base URLs/sizes come from TMDB's `configuration` endpoint (cached).

---

## 5. The "Anime" rail (resolves PRD Q1 / ADR-005)
"Anime" is a **discovery category, not a media type** ([Data Models](./data-models.md)). The Home "Popular Anime" rail ([PRD-HOME-2](../01-product/prd.md)) is a curated **TMDB Discover** query.

- **Baseline definition:** Discover with **Animation genre (16)** + **`with_original_language=ja`**, sorted by popularity. Optionally refined with keyword filters (e.g. anime-related keyword IDs) if accuracy needs improvement.
- This is intentionally a *configuration* concern, tunable without data-model changes. The exact final query parameters are recorded here and may be refined during implementation; any change is a config tweak, not a schema change — exactly why anime was kept out of the media-type model.

---

## 6. Error mapping
`tmdbClient` maps transport/HTTP/validation failures into a small, typed error set the UI understands (e.g. `Offline`, `RateLimited`, `NotFound`, `Unexpected`). The UI renders these via the four-state contract — friendly, recoverable, never a raw code ([FS §1.1](../01-product/functional-specifications.md)).

---

## 7. Legal attribution (required)
TMDB's terms require visible attribution. WatchVerse will:
- Display **"This product uses the TMDB API but is not endorsed or certified by TMDB."** and the **TMDB logo** in an appropriate, consistent location (e.g. footer/about), designed into the UI from the start ([PRD-SYS-8](../01-product/prd.md)).
- Respect TMDB's branding and usage guidelines for logos and imagery.
This is a hard requirement, not optional polish, and is part of [Security & Privacy](./security-and-privacy.md) / legal compliance.

---

## 8. The API credential (pointer)
In a client-only app the TMDB credential is exposed to the browser. This is an accepted, documented reality with a mitigation path (read-scoped key now; optional thin proxy when a backend arrives in Phase 10). Full treatment: [Security & Privacy](./security-and-privacy.md).

---

### Related documents
- [Architecture Overview](./architecture-overview.md) — where the TMDB boundary sits
- [Data Models](./data-models.md) — domain shapes TMDB data is mapped into (and kept separate from)
- [State & Persistence](./state-and-persistence.md) — server-state caching that governs TMDB data
- [Security & Privacy](./security-and-privacy.md) — the API-credential stance and attribution/legal
- [PWA & Offline](./pwa-and-offline.md) — offline behavior for TMDB-backed features
