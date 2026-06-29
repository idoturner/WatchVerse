---
title: Technical Specifications
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 03-architecture
related:
  - ./architecture-overview.md
  - ./state-and-persistence.md
  - ./pwa-and-offline.md
  - ../02-design/design-system.md
  - ../04-engineering/folder-structure.md
  - ./decisions/0000-architecture-philosophy.md
---

# Technical Specifications

> **Purpose.** The concrete technology stack of WatchVerse: the libraries chosen, *why* each is chosen, the build/PWA tooling, configuration approach, fonts, and deployment/environment. It turns the [Architecture Overview](./architecture-overview.md) into specific, installable technology.
>
> **Owns:** the stack, tooling, configuration, and deployment/environment decisions.
> **Does not own:** the architecture's shape ([Architecture Overview](./architecture-overview.md)); token/component design ([Design System](../02-design/design-system.md)); or storage mechanics ([State & Persistence](./state-and-persistence.md)).

Selections follow [ADR-000](./decisions/0000-architecture-philosophy.md): mature, predictable, well-understood tools over novel ones; each earns its place.

---

## 1. Core stack

| Concern | Choice | Why (briefly) |
| --- | --- | --- |
| Language | **TypeScript (strict)** | Strong typing for a domain-rich app; types derived from Zod = one source of truth. |
| UI library | **React 18+** | Mature ecosystem; concurrent features aid responsiveness. |
| Build tool | **Vite** | Fast HMR, minimal config, ideal for a client-only SPA. No SSR need (TMDB is the data source) ⇒ Next.js would add unused complexity ([ADR-000](./decisions/0000-architecture-philosophy.md)). |
| Routing | **React Router (data router)** | URL-driven filters/search; loaders pair cleanly with Query. |
| Server state | **TanStack Query** | Caching, dedup, background refetch, retries, cancellation for all TMDB data. Hand-rolling this is the #1 rot risk. |
| Client state | **Zustand** | Tiny, unopinionated, selector-based; right size for local user data. Redux would be over-engineering here. |
| Forms | **React Hook Form** | Minimal re-renders for review/profile/collection forms. |
| Validation | **Zod** | Runtime validation of TMDB + storage + imports; single source for types. |
| Styling | **Tailwind CSS + CSS variable tokens** | Velocity + consistency via constrained tokens; CSS vars enable runtime theming ([Design System](../02-design/design-system.md)). |
| Variants | **CVA (class-variance-authority)** | Type-safe component variants (Button, Badge, etc.). |
| Class merging | **clsx + tailwind-merge** (`cn()`) | Clean, conflict-free className composition. |
| Headless UI | **Radix UI** | Accessible primitives (modal, dropdown, tabs, tooltip, slider, toast) — solves focus/ARIA. Never hand-roll a modal. |
| Animation | **Framer Motion** | Layout/shared-element transitions, springs, `AnimatePresence`; the cinematic motion layer. |
| Icons | **Lucide React** | Clean, consistent, tree-shakeable single icon family. |
| Toasts | **Sonner** | Beautiful, promise-aware, supports the Undo pattern. |
| Charts | **Recharts** | Accessible-enough, fast to build statistics visualizations. |
| Command palette (Phase 9) | **cmdk** | Deferred power-user accelerator. |
| Dates | **date-fns** | Tree-shakeable date math for watch dates/decades/"added ago". |
| IDs | **nanoid** | Stable opaque entity IDs ([Data Models](./data-models.md)). |

**Deliberately excluded:** Redux (over-engineering), Next.js (no server need), a component kit like MUI/Chakra (fights the custom cinematic identity — we want headless + our own design system), Axios (native `fetch` + Query suffices).

---

## 2. Fonts
- **Display:** **Sora** · **Body:** **Inter** (decided, [Design System §5.1](../02-design/design-system.md)).
- **Self-hosted** (via `@fontsource` or local files) rather than a CDN, for **performance** (no third-party round-trip, works offline in the PWA) and **privacy** (no external font requests; aligns with [Security & Privacy](./security-and-privacy.md)).
- Ship only the weights actually used (400/500/600/700) and `font-display: swap`.

---

## 3. Build, PWA, and tooling
- **Vite** for dev/build; route-level **code-splitting** (lazy routes) to keep the initial bundle small.
- **PWA** via **`vite-plugin-pwa`** (Workbox under the hood): generates the service worker and manifest; precaches the app shell and static assets ([PWA & Offline](./pwa-and-offline.md)).
- **Testing:** **Vitest** + **React Testing Library**; **MSW** to mock TMDB; **Playwright** for a few critical E2E flows ([Testing Strategy](../04-engineering/testing-strategy.md)).
- **Quality:** **ESLint** (+ typescript-eslint), **Prettier**, strict `tsconfig`. Import-boundary lint rules enforce the [dependency rules](./architecture-overview.md) (e.g. `localStorage` only in the repository folder).
- **Package manager / Node:** pinned versions recorded in the repo (`.nvmrc`/`engines`) for predictable builds.

---

## 4. Configuration & environment

> *(This section fulfils the planning-phase commitment to give deployment/env config a clear home.)*

- **Environment variables** (Vite `import.meta.env`, prefixed `VITE_`):
  - `VITE_TMDB_API_BASE` — TMDB base URL.
  - `VITE_TMDB_ACCESS_TOKEN` (or API key) — TMDB credential. **Note:** in a client-only app this is exposed to the browser; this is an accepted, documented reality with a mitigation plan in [Security & Privacy](./security-and-privacy.md), not a secret we pretend to hide.
- A committed **`.env.example`** documents required variables; real values are never committed.
- App constants (query keys, route paths, storage namespace, schema version) live in `config/`, not scattered.

---

## 5. Deployment
- **Static hosting.** WatchVerse is a static SPA/PWA; it deploys to any static host/CDN (e.g. Netlify, Vercel static, Cloudflare Pages, GitHub Pages). No server runtime is required in v1.0.
- **HTTPS is required** for PWA/service-worker installation.
- **Caching headers:** long-cache hashed assets; the service worker manages app-shell freshness and update prompts ([PWA & Offline](./pwa-and-offline.md)).
- **Future backend (Phase 10):** when added, a thin API/proxy can also hide the TMDB credential; the static frontend deployment model is otherwise unchanged ([Security & Privacy](./security-and-privacy.md)).

---

## 6. Versioning & dependency policy
- Exact versions are pinned in the lockfile; majors are upgraded deliberately, not automatically.
- New dependencies are weighed against [ADR-000](./decisions/0000-architecture-philosophy.md): does it earn its maintenance cost, and is it well-supported? Prefer fewer, well-understood libraries. Supply-chain considerations: [Security & Privacy](./security-and-privacy.md).

---

### Related documents
- [Architecture Overview](./architecture-overview.md) — the layers this stack implements
- [State & Persistence](./state-and-persistence.md) — Query/Zustand/storage usage in depth
- [PWA & Offline](./pwa-and-offline.md) — the PWA tooling and offline strategy
- [Design System](../02-design/design-system.md) — Tailwind/tokens/fonts this realizes
- [Testing Strategy](../04-engineering/testing-strategy.md) — the test tooling listed here
