---
title: Folder Structure
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 04-engineering
related:
  - ./coding-standards.md
  - ./testing-strategy.md
  - ../03-architecture/architecture-overview.md
  - ../03-architecture/decisions/0000-architecture-philosophy.md
---

# Folder Structure

> **Purpose.** The authoritative layout of the WatchVerse codebase: where every kind of code lives, the rules that govern dependencies between folders, and how to decide where new code goes. It makes the [Architecture Overview](../03-architecture/architecture-overview.md) concrete for day-to-day work.
>
> **Owns:** code organization, folder/file placement rules, and the dependency rules' enforcement home.
> **Does not own:** how code is written within a file ([Coding Standards](./coding-standards.md)); the architecture's reasoning ([Architecture Overview](../03-architecture/architecture-overview.md)).

This folder is deliberately practical. Per [ADR-000](../03-architecture/decisions/0000-architecture-philosophy.md): a new contributor should be able to find the right place for code without guessing.

---

## 1. Top-level `src/` layout

```
src/
├── app/                      # App shell, providers, routing
│   ├── App.tsx
│   ├── router.tsx            # createBrowserRouter, lazy routes, route paths
│   └── providers.tsx         # QueryClient, RepositoryProvider, Toaster, theme
│
├── features/                 # Vertical feature slices (the product)
│   ├── home/
│   ├── discover/             # search movies + TV (shared engine)
│   ├── title-details/        # movie & TV detail screens
│   ├── library/
│   ├── collections/
│   ├── tags/
│   ├── dashboard/            # profile + stats + activity surfaces
│   ├── statistics/
│   ├── achievements/
│   ├── activity/
│   ├── cinema-mode/          # the random picker
│   ├── recommendations/      # "Recommended For You" surface
│   ├── settings/
│   └── onboarding/
│
├── shared/                   # Cross-feature, reusable, app-agnostic
│   ├── ui/                   # the Design System components (Button, Poster, …)
│   ├── hooks/                # useDebounce, useMediaQuery, useOnlineStatus, …
│   ├── lib/                  # cn(), formatters, date utils, small helpers
│   └── motion/               # shared Framer variants & motion presets
│
├── data/                     # DATA-ACCESS LAYER (the only outward boundary)
│   ├── tmdb/
│   │   ├── tmdbClient.ts     # fetch wrapper, auth, error mapping
│   │   ├── tmdb.schemas.ts   # Zod schemas for TMDB responses
│   │   ├── tmdb.mappers.ts   # TMDB DTO → domain types
│   │   └── queries/          # TanStack Query hooks (useTrending, useTitle, …)
│   ├── repository/
│   │   ├── LibraryRepository.ts          # the async interface (the contract)
│   │   ├── repositoryProvider.tsx        # binds the active implementation
│   │   ├── localStorage/                  # v1.0 implementation (ONLY place with localStorage)
│   │   │   ├── LocalStorageLibraryRepository.ts
│   │   │   ├── storage.ts                 # raw get/set + Zod guard
│   │   │   └── migrations.ts              # schema-version migrations
│   │   └── api/                           # future backend impl (placeholder)
│
├── domain/                   # PURE domain — no React, no storage
│   ├── types.ts              # derived from schemas (single source: Zod)
│   ├── schemas.ts            # Zod schemas for all domain entities
│   ├── enums.ts              # WatchStatus, MediaType, ActivityType
│   ├── stats/                # pure statistics calculators
│   ├── achievements/         # declarative achievement catalog + evaluator
│   └── recommendations/      # pure rules-based recommender
│
├── stores/                   # Zustand client-state stores
│   ├── libraryStore.ts
│   ├── collectionsStore.ts
│   ├── tagsStore.ts
│   ├── profileStore.ts
│   └── settingsStore.ts
│
├── styles/
│   ├── tokens.css            # CSS-variable design tokens (Cinema Dark + themes)
│   └── globals.css
│
├── config/                   # constants: query keys, route paths, storage namespace, schema version, themes, env access
│
└── test/                     # MSW handlers, test utilities, fixtures
```

This mirrors the layers in [Architecture Overview §2](../03-architecture/architecture-overview.md): `features`/`shared/ui` = UI; `stores`/`domain`/`data/tmdb/queries` = application/domain; `data` = data-access.

---

## 2. Feature slice anatomy

Each `features/<feature>/` folder is a self-contained vertical slice:

```
features/library/
├── components/        # components used ONLY by this feature
├── hooks/             # feature-specific hooks (compose stores/queries)
├── library.types.ts   # types local to this feature (not domain entities)
├── routes.tsx         # this feature's route screen(s), if any
└── index.ts           # the feature's PUBLIC surface (what others may import)
```

- A feature exposes only what it intends to share via `index.ts`. Other features import **only** from that public surface — never deep into another feature's `components/` ([Architectural Invariant](../03-architecture/architecture-overview.md)).
- When a feature-local component is needed by a second feature, **promote it to `shared/ui`** (the promotion rule, [Design System §8](../02-design/design-system.md)).

---

## 3. Dependency rules (enforced here)

These restate the [Architecture Overview §4](../03-architecture/architecture-overview.md) rules as the place they are enforced (via ESLint import boundaries where feasible, [Technical Specifications §3](../03-architecture/technical-specifications.md)):

1. **`localStorage` (or any storage engine) appears only in `data/repository/localStorage/`.** Anywhere else is a defect.
2. **`features/` and `app/` never import from `data/` directly** — they use `stores/` and `data/tmdb/queries` hooks.
3. **`domain/` imports nothing from React, storage, `data/`, `stores/`, or `features/`.** It is pure; dependencies point inward only.
4. **Features never import another feature's internals** — only its `index.ts`.
5. **`shared/` never imports from `features/`** (shared is feature-agnostic).
6. **Components import design values only from tokens** (`styles/tokens.css` via Tailwind/`cn()`), never raw hex/spacing.

Allowed dependency direction (outer may use inner; never the reverse):
```
app → features → shared → (domain, stores, data hooks) → data/repository (interface) → impl
domain depends on nothing app-specific.
```

---

## 4. Where does new code go? (decision guide)

| You're adding… | It goes in… |
| --- | --- |
| A screen or feature-specific component | `features/<feature>/components/` |
| A component reused across ≥2 features | `shared/ui/` |
| A pure calculation (stats, scoring, formatting of domain data) | `domain/…` (if domain logic) or `shared/lib/` (if generic util) |
| A TMDB call | `data/tmdb/queries/` (hook) + schema/mapper in `data/tmdb/` |
| A user-data read/write | a `stores/*` action → `LibraryRepository` (never direct storage) |
| A new entity shape | `domain/schemas.ts` (+ type derived) and `data-models.md` |
| A new persisted field/shape change | `domain/schemas.ts` + a migration in `…/migrations.ts` + bump schema version |
| A constant (route, query key, namespace) | `config/` |
| A reusable hook | `shared/hooks/` (generic) or `features/<feature>/hooks/` (specific) |

When unsure, prefer the **simpler, more local** placement and promote later if reuse appears ([ADR-000](../03-architecture/decisions/0000-architecture-philosophy.md): abstract/centralize only with evidence).

---

## 5. Naming & files
- **Folders:** `kebab-case` (`title-details`, `cinema-mode`).
- **React component files:** `PascalCase.tsx` (`PosterCard.tsx`), one primary component per file.
- **Hooks:** `useThing.ts`. **Stores:** `thingStore.ts`. **Utilities/modules:** `camelCase.ts`.
- **Types files:** `<scope>.types.ts`. **Schemas:** `*.schemas.ts`. **Tests:** `*.test.ts(x)` next to the unit under test (see [Testing Strategy](./testing-strategy.md)).
- **Path aliases:** `@/` → `src/` (configured in Vite + tsconfig) to avoid `../../../` chains. Detailed import ordering in [Coding Standards](./coding-standards.md).

---

### Related documents
- [Coding Standards](./coding-standards.md) — how code is written within these files
- [Testing Strategy](./testing-strategy.md) — where and how tests live
- [Architecture Overview](../03-architecture/architecture-overview.md) — the layers and invariants this layout enforces
- [Design System §8](../02-design/design-system.md) — the promotion rule for `shared/ui`
