# Contributing to WatchVerse

Thank you for working on WatchVerse. This guide defines how we build and document the project so it stays clean, consistent, and maintainable. It applies to code **and** documentation.

WatchVerse is **documentation-first** and **quality-over-speed**. The product, design, architecture, engineering, and delivery docs in [`docs/`](docs/) are the single source of truth — build faithfully to them.

> Governing principle: [ADR-000 — Architecture Philosophy](docs/03-architecture/decisions/0000-architecture-philosophy.md). Prefer maintainability, clarity, predictability, and simplicity over cleverness or abstraction.

---

## 1. Development workflow

1. **Pick the current phase.** Work follows the [Development Roadmap](docs/05-delivery/development-roadmap.md) — one phase in flight at a time. Check the [Progress Checklist](docs/05-delivery/progress-checklist.md).
2. **Branch** from the default branch: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, or `chore/<short-name>`.
3. **Build to the docs.** Implement against the relevant [PRD](docs/01-product/prd.md) requirements and [Functional Specs](docs/01-product/functional-specifications.md); follow [Folder Structure](docs/04-engineering/folder-structure.md) and [Coding Standards](docs/04-engineering/coding-standards.md).
4. **Test** at the appropriate levels ([Testing Strategy](docs/04-engineering/testing-strategy.md)).
5. **Open a PR** and ensure all checks pass (§4).
6. **Update** the [Progress Checklist](docs/05-delivery/progress-checklist.md) and [Changelog](docs/05-delivery/changelog.md) as part of the change.

### Engineering health gate (every phase)
A phase/feature is **not done** unless, at completion:
- the app **builds successfully**,
- **TypeScript reports zero errors**,
- **ESLint reports zero errors**,
- **all tests relevant to that phase pass**, and
- the application is left in a **deployable, working state** (continuous deployability).

"It works" is not "it's done." Done = integrates cleanly into a healthy codebase.

---

## 2. Coding conventions

Follow [Coding Standards](docs/04-engineering/coding-standards.md) in full. Highlights:
- **TypeScript strict**; no `any` (use `unknown` + narrow). Types are derived from Zod schemas.
- **Design tokens only** in components — no raw hex/spacing ([Design System](docs/02-design/design-system.md)). Compose classes with `cn()`; variants via CVA.
- **Respect the architecture boundaries** ([Architectural Invariants](docs/03-architecture/architecture-overview.md)): `localStorage` only in the repository folder; all persistence via the **async Repository** ([ADR-001](docs/03-architecture/decisions/0001-repository-pattern.md)); `domain/` stays pure; features don't import each other's internals.
- **Accessibility is part of the work** (WCAG 2.1 AA): keyboard, focus, labels, contrast, reduced-motion ([UX, Accessibility & Motion](docs/02-design/ux-accessibility-motion.md)).
- **Four-state contract** on every data view; describe failures using the four [error categories](docs/03-architecture/architecture-overview.md).

---

## 3. Documentation process

The documentation is a product ([Product Principles](docs/00-overview/product-principles.md)). Keep it accurate and disciplined.

### The documentation-stability rule (important)
> **Once a documentation folder is Approved, treat it as stable. Future work builds upon it rather than redefining it. If a change requires modifying an already-approved decision, do not silently edit it. Instead: explicitly identify the conflict, explain why the change is necessary, and propose the revision before making it.**

This preserves internal consistency, versioning, and historical traceability.

### Document lifecycle
`Draft — Pending Approval` → `Approved` (locked) → `Living` (for continuously-updated docs like the checklist and changelog). Each doc declares its `status` in front-matter.

### Tracked revisions to approved docs
When an approved document must change:
1. Make the change explicit and reasoned (not silent).
2. Bump the document's `version` and add a `revision-history` note (and inline note where helpful).
3. Record it in the [Changelog](docs/05-delivery/changelog.md).

### ADRs
Significant or cross-cutting decisions — and any change to a previously-approved decision — are recorded as [Architecture Decision Records](docs/03-architecture/decisions/). Copy [`template.md`](docs/03-architecture/decisions/template.md), use the next number, and add it to the decisions index. ADRs are immutable once `Accepted` (superseded, never edited away).

### Documentation conventions
- One **owner** per document; explicit **owns / does not own** boundaries.
- **Single source of truth** per fact — link, don't duplicate.
- **Cross-reference** related docs (relative links); forward references are fine.
- State **assumptions** and **trade-offs** explicitly.

---

## 4. Pull requests & review

- **Required checks (CI):** type-check, ESLint, unit + integration tests, and a dependency audit must pass to merge. E2E runs on the main branch / release and on PRs touching critical flows ([Testing Strategy](docs/04-engineering/testing-strategy.md)).
- **Scope:** keep PRs focused and reviewable (aligns with phased delivery).
- **Review expectations:** correctness first; then maintainability, readability, consistency, accessibility, performance, and testability. Reviewers check adherence to the docs and the [Architectural Invariants](docs/03-architecture/architecture-overview.md). Formatting is Prettier's job — not a review topic.
- **Green is the only mergeable state.**

---

## 5. Commit message conventions

We use **[Conventional Commits](https://www.conventionalcommits.org/)**:

```
<type>(<optional scope>): <short summary>

<optional body — the why>
<optional footer — BREAKING CHANGE / refs>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`.

Examples:
- `feat(library): add five watch statuses with optimistic updates`
- `fix(rating): support 0.5 steps via keyboard arrows`
- `docs(architecture): clarify async Repository contract`

Commits should be small and meaningful. Reference requirement IDs (e.g. `PRD-LIB-3`) or ADRs where useful.

---

## 6. Versioning & releases

WatchVerse follows **Semantic Versioning** from the first usable release (Phase 3 → `v0.1.0`; `v1.0.0` at Phase 9). See [Development Roadmap → Versioning](docs/05-delivery/development-roadmap.md#3-phase-summary--versioning). Releases are tagged and recorded in the [Changelog](docs/05-delivery/changelog.md).

---

## 7. General guidelines

- **Stay in scope.** Don't introduce new product ideas or abstractions without a documented need (and, if architectural, an ADR). Build WatchVerse as documented.
- **Quality over quantity.** Fewer, finished things ([Product Principles](docs/00-overview/product-principles.md)).
- **When in doubt, simplify** — and ask. Raise conflicts and trade-offs early rather than guessing.

Thank you for helping build WatchVerse faithfully. 🎬
