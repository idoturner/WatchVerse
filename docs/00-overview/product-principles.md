---
title: Product Principles
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 00-overview
related:
  - ./product-vision.md
  - ./anti-goals.md
  - ./success-metrics.md
  - ../02-design/brand-identity.md
---

# Product Principles

> **Purpose.** This is the constitution of WatchVerse. Every product, design, and engineering decision must be defensible against these principles. When two reasonable options exist, the one that better serves these principles wins.
>
> **Owns:** the governing values and the decision-priority order.
> **Does not own:** specific features ([PRD](../01-product/prd.md)) or visual specifics ([Design System](../02-design/design-system.md)).

These principles are deliberately short, opinionated, and few. A principle that is never used to *reject* an option is not a principle — it is decoration. Each one below includes how it is enforced, so it has teeth.

---

## The Decision Priority Order

When principles or trade-offs conflict, resolve them in this exact order:

1. **User Experience**
2. **Accessibility**
3. **Maintainability**
4. **Performance**
5. **Scalability**
6. **Visual Polish**
7. **Additional Features**

> Read this as: a more polished animation is never worth a maintainability mess; a new feature is never worth degrading the core experience. Accessibility sits near the very top deliberately — it is a **core product-quality requirement** (WCAG 2.1 AA, see [SRS](../03-architecture/srs.md)), not a secondary concern to be traded away for convenience. The ordering only governs genuine, unavoidable trade-offs; nothing in this list is ever truly "optional."

---

## The Principles

### 1. Poster-First Experience
Movie and TV posters are the primary visual language of WatchVerse. Users should browse, recognize, and remember content visually wherever possible. Text supports the imagery; it does not replace it.

**Why.** The product's identity is cinematic. Posters carry emotion and recognition that lists of titles cannot.
**Enforced by.** The `Poster` component is the most-invested primitive in the [Design System](../02-design/design-system.md); grids are poster-led by default; text-dense layouts require justification.

### 2. Less Is More
Every interaction, animation, and UI element must earn its place. A capability is not added simply because it is possible. Restraint is a feature.

**Why.** Clutter is the enemy of a premium feel and of focus.
**Enforced by.** [Anti-Goals](./anti-goals.md); the phased roadmap with a hard ship line; mandatory justification for new UI surfaces in code review (see [CONTRIBUTING](../../CONTRIBUTING.md)).

### 3. Progressive Disclosure
Show essential information first; reveal depth on demand. The app stays approachable for a newcomer while rewarding power users who go deeper.

**Why.** Depth and simplicity are not opposites if depth is layered correctly.
**Enforced by.** Title detail pages, filters, and settings surface advanced options only when the user reaches for them.

### 4. Consistency Above All
Buttons, cards, filters, dialogs, typography, spacing, motion, and badges follow one unified language. Interaction patterns are not reinvented per page.

**Why.** Consistency is what makes a product feel trustworthy and learnable; it is also what makes a codebase maintainable.
**Enforced by.** Tokens-only styling, a shared component library with a promotion rule ("used on a second screen ⇒ it becomes a shared component"), and the [Design System](../02-design/design-system.md) as the single source of UI truth.

### 5. Delight Through Polish
Small, purposeful microinteractions make the app feel premium. Motion communicates feedback and meaning — it never decorates and never distracts.

**Why.** The difference between a tool and a product people love is the felt quality of a thousand small moments.
**Enforced by.** Centralized motion presets, reserved signature moments (Cinema Mode, achievement unlocks), and strict respect for `prefers-reduced-motion`. See [UX, Accessibility & Motion](../02-design/ux-accessibility-motion.md).

### 6. Performance Feels Like a Feature
The app must always feel smooth and responsive. Perceived performance (skeletons, smooth transitions, optimistic updates, efficient rendering) is treated as part of the design, not an afterthought.

**Why.** Latency is felt as low quality regardless of how beautiful a screen is.
**Enforced by.** Measurable performance targets in the [SRS](../03-architecture/srs.md); skeletons in the [Four-State Contract](./glossary.md#f); list virtualization and selector-based state subscriptions.

### 7. Build For Tomorrow
Prefer decisions that simplify future expansion without over-complicating today. Build a strong foundation while keeping the MVP focused.

**Why.** A local-first MVP that quietly anticipates a backend, more themes, and episode-level tracking costs little now and saves a rewrite later.
**Enforced by.** The [Repository](./glossary.md#r) boundary, semantic [theme tokens](../02-design/design-system.md), season-tracking designed to extend to episodes, and observability-ready (but absent) hooks. Captured as [ADRs](../03-architecture/decisions/).

### 8. Quality Over Quantity
Fewer features that feel finished beat many features that feel half-built. Each feature must meet a high quality bar — across all four states, responsive, accessible, and polished — before the next begins.

**Why.** Reputation and trust are built on the worst feature a user touches, not the best.
**Enforced by.** The folder-at-a-time, phase-at-a-time delivery model; "done" defined as meeting the [Four-State Contract](./glossary.md#f) and accessibility/performance targets, not "it renders".

### 9. Your Data Is Sacred
WatchVerse is [local-first](./glossary.md#l): the user's watching life lives on their device, with no server backup in Version 1.0. The app must never silently lose, corrupt, or destroy that data, and must always offer a way back.

**Why.** A user's curated library represents years of personal history. Losing it once destroys all trust permanently.
**Enforced by.** Versioned schema with safe migrations; [Zod](./glossary.md#z) validation on every read; undo on destructive actions; confirmation dialogs; JSON import/export from Phase 3; reliable, batched persistence. This principle is also why a future cloud sync is treated as a sacred-data feature, not a convenience. See [Security & Privacy](../03-architecture/security-and-privacy.md).

### 10. Documentation Is a Product
WatchVerse is built documentation-first. The documentation set is itself a product: it must remain accurate, navigable, versioned, and useful enough that a new developer with no prior context could understand the project and contribute without guessing.

**Why.** If the documentation becomes stale, unclear, or contradictory, the implementation will inevitably drift from the vision, and the cost of every future change rises. Documentation that no one trusts is worse than no documentation at all, because it actively misleads.
**Enforced by.** Folder-by-folder documentation reviews; clear ownership boundaries on every document; [ADRs](../03-architecture/decisions/) for significant decisions; versioned documents with an explicit status lifecycle (Draft → In Review → Approved → Living); [changelog](../05-delivery/changelog.md) updates; a single source of truth per fact; and cross-references that keep the set internally consistent. See [CONTRIBUTING](../../CONTRIBUTING.md).

---

## How to use this document
- **Proposing a feature?** Check it against [Anti-Goals](./anti-goals.md) and Principles 2 and 8 first.
- **Facing a trade-off?** Apply the Decision Priority Order above.
- **Making a significant technical choice?** Record it as an [ADR](../03-architecture/decisions/) and cite the principle it serves.

---

### Related documents
- [Product Vision](./product-vision.md) — the vision these principles protect
- [Anti-Goals](./anti-goals.md) — the explicit boundaries that follow from these principles
- [Success Metrics](./success-metrics.md) — how we measure whether the principles are working
- [Brand Identity](../02-design/brand-identity.md) — how these principles express as voice and feel
