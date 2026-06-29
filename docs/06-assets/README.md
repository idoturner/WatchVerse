---
title: Assets
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 06-assets
related:
  - ../02-design/brand-identity.md
  - ../02-design/design-system.md
  - ../03-architecture/pwa-and-offline.md
  - ../03-architecture/tmdb-integration.md
---

# Assets

> **Purpose.** Home for WatchVerse's static project assets — brand, icons, PWA icons, wireframes, mockups, screenshots, and marketing material — plus the conventions that keep this folder from becoming a dumping ground.
>
> **Owns:** asset storage conventions (structure, naming, formats).
> **Does not own:** the brand/visual *design* itself ([Brand Identity](../02-design/brand-identity.md), [Design System](../02-design/design-system.md)).

Most subfolders are **empty at this stage** — the structure exists so assets have a clear, predictable home when they are produced.

---

## 1. Structure

```
06-assets/
├── brand/         # logo (full, mark-only), wordmark, brand color swatches
├── icons/         # in-app iconography exports (beyond the Lucide set), favicons
├── pwa/           # PWA install icons (standard + maskable, all required sizes) + manifest art
├── wireframes/    # low-fidelity layout sketches
├── mockups/       # high-fidelity design mockups
├── screenshots/   # product screenshots (for README, marketing, stores)
└── marketing/     # promotional/social assets
```

Create a subfolder's contents as they are produced; keep the folder present (with this README or a `.gitkeep`) until then.

---

## 2. Conventions

- **Naming:** `kebab-case`, descriptive, with size/variant where relevant — e.g. `logo-full.svg`, `logo-mark.svg`, `icon-maskable-512.png`, `home-desktop-dark.png`, `wireframe-library-mobile.png`.
- **Formats:**
  - **Vector (SVG)** for logos, wordmark, and scalable icons — preferred wherever possible.
  - **PNG** for raster icons/screenshots requiring transparency or fixed resolution.
  - **PWA icons** per [PWA & Offline](../03-architecture/pwa-and-offline.md): provide standard **and** maskable variants at the required sizes (e.g. 192/512), referenced by the web app manifest.
- **Colors** must match the [Design System](../02-design/design-system.md) tokens (Cinema Dark); brand swatches here are exports of those tokens, not a second source of truth.
- **Optimize** raster assets (compress) and **minify** SVGs before committing; keep the repo lean.
- **Source vs. export:** if a design has an editable source (e.g. Figma), link it from `mockups/` notes rather than committing large binaries; commit the exported, optimized asset.

---

## 3. Third-party assets (important)

- **TMDB logo & imagery** are **not** WatchVerse assets and are **not** stored here as if they were ours. TMDB attribution and logo usage follow TMDB's brand guidelines as described in [TMDB Integration §7](../03-architecture/tmdb-integration.md). Reference TMDB's official assets per their terms.
- Do not commit movie/TV poster or backdrop images — those are fetched at runtime from TMDB, never bundled.
- Any third-party asset must have a license compatible with the project and be attributed where required.

---

### Related documents
- [Brand Identity](../02-design/brand-identity.md) — the brand these assets express
- [Design System](../02-design/design-system.md) — the tokens brand assets must match
- [PWA & Offline](../03-architecture/pwa-and-offline.md) — the PWA icon/manifest requirements
- [TMDB Integration](../03-architecture/tmdb-integration.md) — TMDB logo/attribution rules
