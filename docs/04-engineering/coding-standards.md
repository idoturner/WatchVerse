---
title: Coding Standards
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 04-engineering
related:
  - ./folder-structure.md
  - ./testing-strategy.md
  - ../03-architecture/architecture-overview.md
  - ../03-architecture/state-and-persistence.md
  - ../02-design/design-system.md
  - ../03-architecture/decisions/0000-architecture-philosophy.md
---

# Coding Standards

> **Purpose.** The conventions for *how code is written* in WatchVerse, so that the codebase reads as if one careful person wrote it: consistent, readable, and maintainable. Practical rules, not theory.
>
> **Owns:** code style, naming, component/state/error patterns, and import/formatting conventions.
> **Does not own:** where code lives ([Folder Structure](./folder-structure.md)); testing ([Testing Strategy](./testing-strategy.md)); design tokens/components ([Design System](../02-design/design-system.md)).

Governing principle ([ADR-000](../03-architecture/decisions/0000-architecture-philosophy.md)): **clarity over cleverness**. Code that is obvious beats code that is impressive.

---

## 1. TypeScript
- **Strict mode on** (`strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`). No implicit `any`.
- **`any` is banned**; use `unknown` at boundaries and narrow. Escapes require an inline justification comment.
- **Types come from Zod.** Domain types are inferred from schemas (`z.infer`), never hand-duplicated — single source of truth ([Data Models](../03-architecture/data-models.md)).
- Prefer **`type`** aliases for data shapes; `interface` for extendable contracts (e.g. `LibraryRepository`).
- Use **discriminated unions** for variant data (e.g. error categories, media-type-specific shapes) over optional-field soup.
- No non-null assertions (`!`) except with a justifying comment; prefer explicit narrowing.

## 2. Naming
- **Components:** `PascalCase`. **Hooks:** `useCamelCase`. **Functions/variables:** `camelCase`. **Constants:** `UPPER_SNAKE` for true constants; `camelCase` for config objects.
- **Booleans** read as predicates: `isLoading`, `hasReview`, `canRemove`.
- **Store actions** are verbs describing intent: `markCompleted(id)`, not `setStatus(id, 'completed')` — business rules live in the action ([State & Persistence §3.1](../03-architecture/state-and-persistence.md)).
- **Event handlers:** `handleX`; props for them: `onX`.
- Names say *what/why*, not *how*; avoid abbreviations except well-known ones (id, url, tmdb).

## 3. React components
- **Function components only**, typed props via a `Props` type. No `React.FC`.
- **One primary component per file**; small private subcomponents may share the file.
- **Keep components small and focused.** Extract logic into hooks; extract repeated markup into `shared/ui` (promotion rule).
- **Derive, don't sync.** Compute from props/state during render; avoid `useEffect` that mirrors state. Reserve `useEffect` for genuine side effects (subscriptions, imperative DOM, non-React systems).
- **Stable keys** in lists (entity `id`, never array index).
- **Accessibility is part of the component**, not an afterthought: semantic elements, labels, focus, per [UX, Accessibility & Motion](../02-design/ux-accessibility-motion.md). Build interactive primitives on **Radix**; never hand-roll a modal/menu/slider.

## 4. Styling
- **Tailwind utilities driven by tokens.** No raw hex, no off-scale spacing — only token-backed utilities ([Design System](../02-design/design-system.md)). Raw values are design debt.
- **Compose classes with `cn()`** (`clsx` + `tailwind-merge`); never string-concatenate classes.
- **Component variants via CVA**, not ad-hoc conditional class strings.
- Keep JSX readable: extract long conditional class logic into a `cn()`/CVA call or a small variant map, not inline ternary pileups (avoids the "huge unreadable class string" pitfall).
- No inline `style` except for genuinely dynamic values that cannot be a token (rare; justify).

## 5. State & data usage
- **Respect the four state kinds** ([State & Persistence §1](../03-architecture/state-and-persistence.md)): server → TanStack Query; client → Zustand+Repository; URL → router params; ephemeral → `useState`. Don't cross them.
- **Subscribe to stores via selectors**, never the whole store, to avoid re-render storms.
- **All persistence goes through the Repository** (async) — never call `localStorage` from a feature/store-consumer. `await` repository calls; handle pending/failure ([ADR-001](../03-architecture/decisions/0001-repository-pattern.md)).
- **Optimistic updates** for local mutations, with rollback on failure ([State & Persistence §4](../03-architecture/state-and-persistence.md)).
- **TMDB access only via `data/tmdb/queries` hooks**; components never call `tmdbClient` directly.
- **Domain logic stays pure** in `domain/` (no React, no I/O) so it's testable and portable.

## 6. Error handling (use the shared vocabulary)
Handle and describe failures using the four categories from [Architecture Overview §9](../03-architecture/architecture-overview.md):
- **Validation Errors** — validate at boundaries with Zod; on failure, quarantine/reject, never trust. Don't `try/catch`-and-ignore.
- **Network Errors** — let TanStack Query manage retries; render offline/retry states; never block local features.
- **Recoverable User Errors** — prevent or guide inline (e.g. enforce the 500-char review cap); never punish.
- **Unexpected Internal Errors** — wrap feature areas in **error boundaries** with a friendly fallback; route to the (unwired) `reportError` seam ([Security & Privacy](../03-architecture/security-and-privacy.md)). Never surface a raw stack trace.
- All four render through the **four-state contract** ([Functional Specifications §1.1](../01-product/functional-specifications.md)).

## 7. Imports & file organization
- **Import order:** external packages → `@/` aliased internal modules → relative siblings → styles/assets. (ESLint enforces; no manual bikeshedding.)
- Use the **`@/` alias**, not deep `../../../` chains.
- Avoid broad barrel files that obscure dependencies; `features/*/index.ts` is the deliberate public surface (allowed).
- No unused exports; no dead code (lint-enforced).

## 8. Comments & docs
- Code should be self-explanatory; comment the **why**, not the **what**.
- Justify any deliberate deviation (an `any`, a `!`, an effect-as-sync) inline.
- Public, non-obvious functions (e.g. a stats calculator, a migration) get a short doc comment describing intent and edge cases.
- Keep comments truthful and current — a wrong comment is worse than none.

## 9. Async & performance
- `async/await` over raw `.then` chains; handle rejection paths.
- Memoize expensive derived computations (`useMemo`) and pure domain calculators; don't over-memoize trivial values.
- Virtualize long lists (>~100 items) ([SRS NFR-PERF-5](../03-architecture/srs.md)).
- Animate `transform`/`opacity` only; respect reduced-motion ([UX, Accessibility & Motion §3](../02-design/ux-accessibility-motion.md)).

## 10. Tooling & enforcement
- **ESLint + Prettier + TypeScript** run in CI; a failing lint/type-check blocks merge.
- Import-boundary rules enforce the [dependency rules](./folder-structure.md) where feasible.
- Formatting is Prettier's job — never argue about it in review.
- Conventions here are enforced by tooling first, review second (see [CONTRIBUTING](../../CONTRIBUTING.md)).

---

### Related documents
- [Folder Structure](./folder-structure.md) — where this code lives
- [Testing Strategy](./testing-strategy.md) — how it's verified
- [State & Persistence](../03-architecture/state-and-persistence.md) — state/Repository usage rules
- [Design System](../02-design/design-system.md) — tokens/components/`cn()`/CVA
- [Architecture Overview §9](../03-architecture/architecture-overview.md) — the error vocabulary used here
