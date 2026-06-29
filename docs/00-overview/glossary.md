---
title: Glossary
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 00-overview
related:
  - ./product-vision.md
  - ./product-principles.md
  - ../01-product/prd.md
  - ../03-architecture/data-models.md
---

# Glossary

> **Purpose.** This document defines the canonical vocabulary of the WatchVerse project. Every other document uses these terms with exactly the meaning given here. If a term is ambiguous anywhere in the documentation, this file is the tie-breaker.
>
> **Owns:** terminology and definitions.
> **Does not own:** how anything is built (see [Architecture](../03-architecture/architecture-overview.md)) or what the product does (see [PRD](../01-product/prd.md)).

This glossary is written for a reader who has never spoken with the WatchVerse team. No prior knowledge is assumed.

---

## A

**Achievement**
A milestone the user unlocks through their own activity (e.g. "Watched 50 movies", "Completed a show in one day"). Achievements are defined declaratively as data, evaluated against the user's [Statistics](#s), and celebrated with an unlock animation. Achievements are a personal, single-player reward system — never a competitive or social one (see [Anti-Goals](./anti-goals.md)).

**ADR (Architecture Decision Record)**
A short, numbered document capturing one significant technical decision, its context, and its consequences. ADRs are how WatchVerse evolves "within stable boundaries": instead of silently rewriting history, a new ADR supersedes an old one. Stored in [`03-architecture/decisions/`](../03-architecture/decisions/).

**Anti-Goal**
A capability or direction WatchVerse *intentionally* will not pursue, documented to protect the product vision from scope creep. See [Anti-Goals](./anti-goals.md).

**App Shell**
The minimal HTML, CSS, and JavaScript required to render the application's UI frame (navigation, layout, loading states) independently of any content. Cached by the [Service Worker](#s) so WatchVerse opens instantly and works offline. See [PWA & Offline](../03-architecture/pwa-and-offline.md).

---

## C

**Cinema Mode**
The premium, full-screen presentation of the [Random Picker](#r). It theatrically "spins" and reveals a single suggested title from the user's watchlist, designed as a signature delight moment. Cinema Mode *is* the random picker — they are one feature, not two.

**Client State**
Application state owned by the user and the running app — the user's library, collections, tags, profile, settings, and UI state. Managed locally (Zustand + the [Repository](#r)) and persisted on-device. Contrast with [Server State](#s). See [State & Persistence](../03-architecture/state-and-persistence.md).

**Collection**
A user-created, named grouping of titles (e.g. "Marvel", "Date Night", "Christopher Nolan"). Collections are unlimited and contain references to titles, not copies. A title may belong to many collections. Contrast with [Tag](#t), which is lighter-weight.

---

## D

**Design Token**
A named, central design value (a color, spacing step, radius, type size, motion duration) that components reference instead of hard-coded values. Tokens are the single source of visual truth and the mechanism that makes [Theming](#t) possible. See [Design System](../02-design/design-system.md).

---

## E

**Empty State**
The intentionally designed screen shown when a list or page has no content yet (e.g. an empty library). In WatchVerse an empty state is a first-class, guiding experience with illustration, message, and a clear primary action — never a blank area. Part of the [Four-State Contract](#f).

**Episode**
A single installment of a [Season](#s). **Per-episode tracking is intentionally deferred** beyond Version 1.0; v1.0 tracks TV at the [Season](#s) level. The data model is designed so episode-level tracking can be added later without major refactoring.

---

## F

**Four-State Contract**
The rule that every data-driven view must explicitly handle four states: **loading** (skeleton), **empty** ([Empty State](#e)), **error** (recoverable, friendly), and **loaded**. Offline is treated as a specific, friendly variant of the error/empty states. See [Functional Specifications](../01-product/functional-specifications.md).

---

## L

**Library**
The complete set of titles a user is tracking, in any [Watch Status](#w). The library is the heart of WatchVerse and lives entirely on the user's device.

**LibraryEntry**
The canonical data record representing one tracked title and everything the *user* has recorded about it: the title reference (TMDB id, media type, and a small snapshot of title/poster/year), [Watch Status](#w), [Rating](#r), [Review](#r), watch date, rewatch count, season progress (for TV), tags, and timestamps. A `LibraryEntry` is deliberately separate from TMDB's data about the title. See [Data Models](../03-architecture/data-models.md).

**Local-First**
An architectural stance in which the user's data is created, stored, and fully usable on their own device without requiring a server. WatchVerse Version 1.0 is fully local-first; a future backend is an *enhancement*, not a dependency. This stance is what gives the ["Your Data Is Sacred"](./product-principles.md) principle its weight.

---

## M

**Media Type**
Whether a title is a `movie` or a `tv` show. Many features behave identically across media types; differences (e.g. season tracking) are explicitly noted where they exist.

---

## P

**Profile**
The user's personal identity within the app: editable display name and the aggregate presentation of their watching life (top titles, favorite genres, statistics). Single-user and local; not an account in the networked sense.

**PWA (Progressive Web App)**
A web application that can be installed to a device, launched like a native app, and function offline via a [Service Worker](#s). WatchVerse is a PWA from Version 1.0. See [PWA & Offline](../03-architecture/pwa-and-offline.md).

---

## R

**Random Picker**
The engine that selects a title at random from the user's watchlist to solve the "what should I watch?" problem. Its premium presentation is [Cinema Mode](#c).

**Rating**
The user's personal score for a title, on a 10-point scale in 0.5 increments, entered through an animated, keyboard-accessible control. Distinct from the **TMDB rating**, which is the aggregate public score from [TMDB](#t).

**Recommended For You**
A personalized Home section that suggests titles derived **from the user's own library** (favorite genres, highly rated titles, favorite directors, recently completed shows, and TMDB's similar/recommended endpoints). It is rules-based, not AI, and becomes more personalized as the library grows. Falls back gracefully to trending/popular content before there is enough signal.

**Repository**
The single abstraction (an interface) through which the entire application reads and writes user data. Version 1.0 implements it with [Local Storage](../03-architecture/state-and-persistence.md); a future backend implements the same interface. This boundary is the project's migration insurance. See [Architecture Overview](../03-architecture/architecture-overview.md).

**Review**
The user's optional, private, plain-text reflection on a title (maximum 500 characters). A Review is intentionally flexible: it can serve as a quick note ("Great ending.", "Watch again with friends.") or a short personal review ("Beautiful cinematography but slow pacing."). Reviews are personal and never shared (see [Anti-Goals](./anti-goals.md)). **"Review" is the single canonical term in WatchVerse; there is no separate "note" concept.**

**Rewatch Count**
The number of times a user has watched a title beyond the first viewing. Feeds [Statistics](#s) and certain [Achievements](#a).

---

## S

**Search History**
A lightweight, local-only, capped list of the user's recent searches, shown when the search interface opens and clearable at any time. Never transmitted off-device.

**Season**
A grouping of [Episodes](#e) within a TV show. Version 1.0 tracks TV progress at the season level (current season, watching/completed/on-hold/dropped status, completion).

**Server State**
State owned by an external system — in Version 1.0, all [TMDB](#t) data (trending, search results, title details, cast, similar). It is cacheable, refetchable, and managed by TanStack Query. Contrast with [Client State](#c).

**Service Worker**
A background script the browser runs separately from the page, enabling offline support, [App Shell](#a) caching, and installability. See [PWA & Offline](../03-architecture/pwa-and-offline.md).

**Settings / Preferences**
Device-level user preferences (view mode, default sort, poster size, reduced motion, theme, default landing page, and more). Stored separately from the user's [Library](#l) so the two can evolve and sync independently.

**Statistics**
Derived, computed insights about the user's watching life (titles watched, average rating, favorite genres, estimated watch hours, completion percentage, etc.). Computed by pure functions from the [Library](#l); never stored as the source of truth.

---

## T

**Tag**
A user-created, lightweight, reusable label applied to titles (e.g. "rainy day", "underrated"). Tags are unlimited and many-to-many with titles. Lighter than a [Collection](#c): a tag is a label; a collection is a curated set.

**Theme**
A named set of values for the design [Tokens](#d) (colors, elevation). Version 1.0 ships one theme, **Cinema Dark**. The architecture supports future themes (e.g. Midnight Blue, OLED Black) with no structural change.

**Title**
The generic term for any trackable piece of content — a movie or a TV show. Used throughout the documentation when a statement applies regardless of [Media Type](#m).

**TMDB (The Movie Database)**
The external public API that supplies all catalog data: movies, TV shows, images, cast, trailers, ratings, and recommendations. WatchVerse consumes TMDB but stores its own user data separately. Use of TMDB requires visible attribution. See [TMDB Integration](../03-architecture/tmdb-integration.md).

---

## W

**Watch Date**
The date the user records having watched (or completed) a title. Feeds [Statistics](#s), the activity timeline, and decade/recency-based [Achievements](#a).

**Watch Status**
The state of the user's relationship with a title. The five canonical statuses are: **Want to Watch**, **Watching**, **Completed**, **On Hold**, and **Dropped**. Status drives much of the library's organization and statistics.

---

## Z

**Zod**
The schema-validation library used to validate all untrusted input — both [TMDB](#t) API responses and data read from local storage — and to derive TypeScript types from a single source. Central to the ["Your Data Is Sacred"](./product-principles.md) principle. See [State & Persistence](../03-architecture/state-and-persistence.md).

---

### Related documents
- [Product Vision](./product-vision.md) — the "why" behind these concepts
- [Product Principles](./product-principles.md) — the values that govern the product
- [PRD](../01-product/prd.md) — how these terms appear as features
- [Data Models](../03-architecture/data-models.md) — the formal shapes of the domain terms above
