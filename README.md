# WatchVerse 🎬

**Your personal cinema journal** — a premium, local-first app to track every movie and TV show you've watched, are watching, or want to watch.

WatchVerse is inspired by the visual richness of Netflix, the curatorial soul of Letterboxd, and the tracking depth of Trakt — while remaining **personal, private, and local-first**. It's poster-first, cinematic, and designed to make remembering and reflecting on what you watch feel as pleasurable as the watching itself.

> **Status — `v1.0.2`, stable & feature-complete.** The first stable release was `v1.0.0` (Phase 9); two focused patches followed — `v1.0.1` (TMDB data-quality & Discover relevance) and `v1.0.2` (Cinema Mode polish). The product is now frozen for portfolio presentation. Built documentation-first; the full spec lives under [`docs/`](docs/). An optional backend/cloud phase (Phase 10) is deliberately deferred future work, not part of the v1.x line (see the [Roadmap](#roadmap)).

**Live demo: [watch-verse-seven.vercel.app](https://watch-verse-seven.vercel.app)** — a static, frontend-only app deployed on Vercel (auto-deploys on every push). See [Deployment](#deployment) for the setup.

### Quality gate

All green on `v1.0.2`:

| `typecheck` | `lint` | `test` | `build` |
| :---: | :---: | :---: | :---: |
| ✅ pass | ✅ 0 / 0 | ✅ **229 passing** | ✅ pass |

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

---

## Features

### In `v1.0.2`
- 🏠 **Home** — discovery rails (trending/popular/upcoming/TV/anime) + Recently added, **Recommended For You** (transparent, non-AI), and **Cinema Mode** random picker
- 🗂️ **Collections & Tags** — curated groups (list + detail) and lightweight labels (chips + Library filter)
- 📊 **Dashboard** — derived statistics (watch hours, completion %, status breakdown, ratings, Top 3 lists) + editable local profile name
- 🏆 **Achievements & activity** — a small, deterministic, local-only achievement catalog (reduced-motion celebrations) and a capped, low-noise activity timeline
- 🔎 **Search & discover** movies and TV via TMDB — debounced search with **autocomplete + history**, genre/year filters, sort, grid/list, poster-first browse
- 🎬 **Title detail pages** — backdrop, poster, overview, cast, director/creator, trailer link, similar titles (basic TV detail too)
- 🎞️ **Track movies & TV** across five statuses — Want to Watch, Watching, Completed, On Hold, Dropped — with quick actions everywhere a title appears
- ⭐ **Personal ratings** (0.5–10), short private **Reviews** (≤500 chars), watch dates, and rewatch counts
- 📺 **Season-level TV tracking** — current season, per-season completion, show completion, with spoiler protection
- 🗂️ **Library screen** — filter by status, sort, grid/list
- ✨ **Onboarding, Settings & command palette** — first-run welcome, a full Settings page (theme scaffold, reduced motion, spoiler protection, confirm-before-delete, data management), and a keyboard command palette (Cmd/Ctrl+K)
- 📱 **Accessible mobile navigation** + calm app/route-level error handling (incl. 404)
- 💾 **Import/Export** your library as JSON (Merge or Replace) — *your data is sacred*
- 🛟 **Data safety** — undo, confirmation dialogs, validation; nothing destroyed silently
- 📴 **Installable PWA** — app shell + local library work offline; TMDB-dependent surfaces fail calmly
- ♿ Accessible, cinematic dark UI with consistent reduced-motion support

### Future (optional)
- ☁️ **Backend/cloud readiness** (Phase 10) — `ApiLibraryRepository` + local→server sync + auth, behind the existing async-Repository seam. Not part of v1.0; only if separately decided to be worth doing.

WatchVerse is intentionally **not** a social network — no followers, comments, ads, or tracking. See [Anti-Goals](docs/00-overview/anti-goals.md).

---

## Technology stack

React 18 · TypeScript (strict) · Vite · React Router · TanStack Query (server state) · Zustand (client state) · Zod (validation) · Tailwind CSS + design tokens · Radix UI · Framer Motion · Lucide · Sonner · Recharts · self-hosted Sora + Inter · PWA (vite-plugin-pwa). Catalog data from **TMDB**.

Full rationale: [Technical Specifications](docs/03-architecture/technical-specifications.md).

---

## Architecture highlights

- **Async `Repository` abstraction (ADR-001).** Every read/write of user data goes through one async `LibraryRepository` interface — the whole app depends on the interface, never the storage engine. Swapping `localStorage` for IndexedDB or a backend later is a one-implementation change, no consumer churn.
- **Local-first, validated persistence.** State lives in the browser via `localStorage`, confined to a single adapter. Every read is **Zod-validated**; corrupt data is quarantined (preserved, never silently dropped) and a safe fallback returned, so bad data can't crash the app or destroy good data.
- **Pure domain core.** Business rules — stats, recommendations, achievements, Cinema Mode eligibility, content-quality filtering — are pure, deterministic, injectable functions, isolated from React and TMDB and unit-tested in isolation.
- **Clear boundaries.** Raw TMDB DTOs are mapped to domain types at the edge (Zod schemas); server state (TanStack Query) is kept separate from client state (Zustand); features are sliced and kept acyclic.
- **Accessibility & reduced-motion.** WCAG-minded patterns (combobox/switch/dialog, focus-visible, landmarks, non-color-only status), with an in-app reduced-motion setting that overrides the OS and governs both CSS and Framer Motion.
- **PWA-ready shell.** Installable, with the app shell and the entire local library working offline; TMDB-dependent surfaces degrade calmly. Heavy deps (charts) are route-split so the main bundle stays lean.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env       # add your TMDB API credential

# 3. Run the dev server
npm run dev
```

Then open the printed local URL. Useful scripts: `npm run build`, `npm run test`, `npm run lint`, `npm run typecheck`.

### TMDB setup

Search and discovery use the free **TMDB** API. Copy `.env.example` to `.env` and set your token:

```bash
# .env
VITE_TMDB_API_BASE=https://api.themoviedb.org/3
VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
VITE_TMDB_ACCESS_TOKEN=your_tmdb_v4_read_access_token_here
```

Get a free **API Read Access Token (v4)** from your [TMDB account → Settings → API](https://www.themoviedb.org/settings/api). Without it, the app still runs and your **local library, Dashboard, Cinema Mode, Settings, and import/export all work** — only the TMDB-backed surfaces (Home rails, search, title details) show their calm "couldn't load" states.

> **Security note:** `VITE_*` variables are inlined into the browser bundle at build time, so they are **not** secret. Use a read-scoped TMDB token; never put a private API secret in a `VITE_*` variable. `.env` is gitignored; only `.env.example` (placeholder) is committed.

---

## Deployment

WatchVerse is a **static, frontend-only SPA** — no server runtime. Any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3+CDN) works.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18+ |
| Env variables | `VITE_TMDB_API_BASE`, `VITE_TMDB_IMAGE_BASE`, `VITE_TMDB_ACCESS_TOKEN` (read-scoped) |

**SPA route fallback (required).** The app uses client-side routing (`/discover`, `/library`, `/cinema`, `/dashboard`, …). Configure the host to rewrite unknown paths to `index.html`, or a hard refresh / direct link to a sub-route will 404:

- **Netlify** — add `public/_redirects` with `/*  /index.html  200`
- **Vercel** — framework preset "Vite" handles this; or add a rewrite of `/(.*)` → `/index.html`
- **Cloudflare Pages** — SPA fallback is automatic for Vite output
- **GitHub Pages** — copy `index.html` to `404.html`

**Live deployment:** [watch-verse-seven.vercel.app](https://watch-verse-seven.vercel.app) (Vercel, using the settings above).

WatchVerse uses the TMDB API but is not endorsed or certified by TMDB.

---

## Documentation Map

The complete, modular documentation lives in [`docs/`](docs/). Start with the [Executive Summary](docs/00-overview/executive-summary.md).

| Area | Folder | Highlights |
| --- | --- | --- |
| **Overview** | [`00-overview`](docs/00-overview/) | [Executive Summary](docs/00-overview/executive-summary.md) · [Vision](docs/00-overview/product-vision.md) · [Principles](docs/00-overview/product-principles.md) · [Anti-Goals](docs/00-overview/anti-goals.md) · [Success Metrics](docs/00-overview/success-metrics.md) · [Glossary](docs/00-overview/glossary.md) |
| **Product** | [`01-product`](docs/01-product/) | [PRD](docs/01-product/prd.md) · [Functional Specs](docs/01-product/functional-specifications.md) · [User Flows](docs/01-product/user-flows.md) |
| **Design** | [`02-design`](docs/02-design/) | [Brand Identity](docs/02-design/brand-identity.md) · [Design System](docs/02-design/design-system.md) · [UX, Accessibility & Motion](docs/02-design/ux-accessibility-motion.md) |
| **Architecture** | [`03-architecture`](docs/03-architecture/) | [Overview](docs/03-architecture/architecture-overview.md) · [Data Models](docs/03-architecture/data-models.md) · [State & Persistence](docs/03-architecture/state-and-persistence.md) · [SRS](docs/03-architecture/srs.md) · [ADRs](docs/03-architecture/decisions/) |
| **Engineering** | [`04-engineering`](docs/04-engineering/) | [Folder Structure](docs/04-engineering/folder-structure.md) · [Coding Standards](docs/04-engineering/coding-standards.md) · [Testing Strategy](docs/04-engineering/testing-strategy.md) |
| **Delivery** | [`05-delivery`](docs/05-delivery/) | [Roadmap](docs/05-delivery/development-roadmap.md) · [Progress Checklist](docs/05-delivery/progress-checklist.md) · [Changelog](docs/05-delivery/changelog.md) |
| **Assets** | [`06-assets`](docs/06-assets/) | brand, icons, PWA, mockups, screenshots |

---

## Roadmap

Built in reviewable phases; the hard **ship line is Phase 3** (a usable, beautiful tracker → `v0.1.0`), with `v1.0.0` reserved for Phase 9. Full plan: [Development Roadmap](docs/05-delivery/development-roadmap.md).

✅ `1`–`7` (→ `v0.5.0`) → ✅ `8` Achievements & Activity (`v0.6.0`) → ✅ **`9` Polish & Hardening — shipped `v1.0.0` 🚀** → ✅ patches `v1.0.1` (Discover relevance) & `v1.0.2` (Cinema Mode) → `10` Backend (optional, future)

---

## Known limitations & future work

Intentional v1 boundaries — deferred by design, not bugs:

- **No backend / cloud sync.** WatchVerse is local-first by design; data lives in the browser. A backend (`ApiLibraryRepository` + sync + auth) is scoped behind the existing async-`Repository` seam (Phase 10) but only if it's worth doing — no accounts, no servers in v1.
- **PWA install icons are on-brand SVG placeholders.** Documented in [`docs/06-assets/pwa`](docs/06-assets/pwa/); finalized artwork + rasterized PNG fallbacks are an optional later swap.
- **Discovery quality depends on the public TMDB API.** Home/Discover apply relevance and content-quality filtering, but the underlying catalog data (and occasional sparse records) come from TMDB.
- **Other deferred features** (planned, not anti-goals): per-episode TV tracking · additional themes (Midnight Blue, OLED Black) · optional cloud sync & accounts. See [Roadmap](docs/05-delivery/development-roadmap.md) and [PRD §3.3](docs/01-product/prd.md).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, coding conventions, documentation process, and commit standards.

---

## Acknowledgements

This product uses the **TMDB** API but is not endorsed or certified by TMDB.
