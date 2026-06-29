---
title: PWA & Offline
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./architecture-overview.md
  - ./technical-specifications.md
  - ./state-and-persistence.md
  - ../01-product/functional-specifications.md
  - ../00-overview/success-metrics.md
---

# PWA & Offline

> **Purpose.** This document specifies how WatchVerse behaves as an installable Progressive Web App and how it works offline: service-worker strategy, app-shell and asset caching, installability, the offline behavior matrix, and the update strategy.
>
> **Owns:** PWA and offline mechanics.
> **Does not own:** which user data exists/where it's stored ([State & Persistence](./state-and-persistence.md)); per-feature offline copy/states ([Functional Specifications](../01-product/functional-specifications.md)); or build tooling beyond a pointer ([Technical Specifications](./technical-specifications.md)).

WatchVerse is a PWA from day one (ADR-004): being installable and offline-capable directly reinforces the "your personal cinema journal" identity and the local-first promise.

---

## 1. Installability
- A **Web App Manifest** provides name, icons (maskable + standard, from `06-assets`), theme/background colors (Cinema Dark), display mode `standalone`, and start URL.
- Served over **HTTPS** (required for service workers).
- Result: WatchVerse can be installed to home screen/desktop and launched like a native app, in its own window, with the cinematic dark chrome.

---

## 2. Service worker strategy
Generated via **`vite-plugin-pwa`** (Workbox) ([Technical Specifications §3](./technical-specifications.md)).

- **App shell (precache):** the HTML/CSS/JS shell, fonts, icons, and core static assets are precached at install, so the app opens **instantly** and works with **no network** ([M11](../00-overview/success-metrics.md)). This is what makes *offline-after-reload* work, not just in-session offline.
- **Runtime caching:**
  - **TMDB JSON** — network-first with a short-lived cache fallback (fresh when online, last-known when not). Primarily governed by TanStack Query; the SW provides a secondary safety net.
  - **TMDB images** — cache-first with a capped, expiring cache (images are immutable per URL; bounded to protect disk).
  - **Fonts/static** — cache-first (self-hosted, immutable, hashed).
- **User data is NOT in the service worker.** It lives in LocalStorage via the Repository ([State & Persistence](./state-and-persistence.md)); the SW caches *assets and TMDB responses*, never the user's library.

---

## 3. Offline behavior matrix
Mirrors [FS §1.5](../01-product/functional-specifications.md) (single source of behavior; restated here for the mechanics):

| Capability | Online | Offline |
| --- | --- | --- |
| Launch app (shell) | ✅ | ✅ (precached) |
| Browse/search/edit local library | ✅ | ✅ |
| Details of a tracked title (user data + cached facts) | ✅ | ✅ |
| Statistics, achievements, activity, collections, tags, reviews | ✅ | ✅ |
| Import/Export, Settings | ✅ | ✅ |
| TMDB search / discovery rails / similar / trailers / new facts | ✅ | ⛔ friendly offline state; local search still offered |
| Recommended For You | ✅ | ⚠️ last cached or graceful hide |

Connectivity is exposed app-wide via `useOnlineStatus`; online-only affordances are **disabled with a short explanation**, never failing on click. A calm, scoped `OfflineBanner` communicates state ([Design System §8.3](../02-design/design-system.md)). No generic error screens, ever.

---

## 4. Update strategy
- The service worker checks for updates on navigation; when a new version is ready, the app shows a **non-intrusive "Update available — refresh"** prompt rather than silently swapping or forcing a reload.
- Precache is versioned/hashed; old caches are cleaned on activation.
- Migrations of *user data* are independent of SW updates and run on load ([State & Persistence §5.2](./state-and-persistence.md)).

---

## 5. Reconnection
When connectivity returns, `useOnlineStatus` flips and TMDB-backed views refetch automatically (TanStack Query). Local data needs no reconciliation because it never depended on the network.

---

## 6. Constraints & non-goals
- **No background sync / push** in v1.0 (would serve no current feature and conflicts with [Anti-Goals](../00-overview/anti-goals.md) on notifications). The SW seam exists, but nothing uses it.
- **No precaching of the entire TMDB catalog** — impossible and pointless; only visited data is runtime-cached.

---

### Related documents
- [State & Persistence](./state-and-persistence.md) — where user data lives (not in the SW)
- [Technical Specifications](./technical-specifications.md) — vite-plugin-pwa/Workbox tooling
- [Functional Specifications](../01-product/functional-specifications.md) — the authoritative offline behavior/copy
- [Architecture Overview](./architecture-overview.md) — offline as a cross-cutting concern
