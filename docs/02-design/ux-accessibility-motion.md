---
title: UX, Accessibility & Motion
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 02-design
related:
  - ./brand-identity.md
  - ./design-system.md
  - ../01-product/functional-specifications.md
  - ../00-overview/success-metrics.md
  - ../03-architecture/srs.md
  - ../03-architecture/pwa-and-offline.md
---

# UX, Accessibility & Motion

> **Purpose.** This document defines the cross-cutting interaction standards of WatchVerse: the responsive strategy, the accessibility commitment and checklist (WCAG 2.1 AA), and the motion guidelines and reduced-motion policy. These are the *rules* every screen and component must follow.
>
> **Owns:** responsive strategy, accessibility rules & checklist, and motion guidelines/policy.
> **Does not own:** token values or component specs ([Design System](./design-system.md)); brand philosophy ([Brand Identity](./brand-identity.md)); per-feature behavior ([Functional Specifications](../01-product/functional-specifications.md)).

These rules operationalize the [Decision Priority Order](../00-overview/product-principles.md), where **Accessibility ranks second only to User Experience**. They are testable; the [Testing Strategy](../04-engineering/testing-strategy.md) and [SRS](../03-architecture/srs.md) reference them as acceptance criteria.

---

## 1. Responsive strategy

WatchVerse must work beautifully on mobile, tablet, laptop, and desktop (`PRD-SYS` / vision). The approach is **mobile-first and content-driven**.

### 1.1 Principles
- **Mobile-first.** Base styles target the smallest screen; complexity is added upward via the breakpoint tokens ([Design System §7](./design-system.md): sm/md/lg/xl/2xl).
- **Content-driven, not device-driven.** Layout responds to available space, not specific device names.
- **Fluid over fixed.** Prefer `clamp()`, `min()`, `max()`, and intrinsic sizing over per-breakpoint hardcoding.

### 1.2 Layout patterns
- **Poster grids:** CSS Grid with `auto-fill` + `minmax()` so columns flow naturally from ~2 (mobile) to ~6–8 (wide desktop) without per-breakpoint column math (`PRD-LIB-9`, [Design System §8.4 TitleGrid](./design-system.md)).
- **Rails:** horizontally scrollable; touch-swipe on mobile, with visible affordances/controls on pointer devices.
- **Detail pages:** single-column stacked (mobile) → two-column with backdrop/poster + content (desktop) (FS §5/§6).
- **Navigation:** **bottom tab bar** on mobile (thumb-reachable, app-like); **sidebar or top navigation** on desktop. Global search is always reachable (`PRD-GLOB-1`).
- **Overlays:** Modals become **bottom sheets/Drawers** on mobile, centered Dialogs on desktop — same content model, responsive presentation ([Design System §8.3](./design-system.md)).

### 1.3 Touch & pointer
- **Touch targets ≥ 44×44px** on touch devices.
- **Hover-only interactions are gated** behind `@media (hover: hover)`; all hover affordances (e.g. poster quick actions) have a touch-equivalent (long-press or explicit control) so nothing is hover-exclusive (FS §3).
- **No essential information in tooltips** (touch users can't hover).

### 1.4 Imagery & performance
- Serve the **right TMDB image size** per context and viewport via `srcset`/appropriate width params — never ship desktop backdrops to phones (image strategy detailed in [TMDB Integration](../03-architecture/tmdb-integration.md)).
- Lazy-load off-screen posters; reserve space (aspect-ratio) to prevent layout shift.
- Honor the poster-size/density preference (`PRD-SET-3`) within the token scale.

---

## 2. Accessibility (WCAG 2.1 AA)

WatchVerse commits to **WCAG 2.1 Level AA** (`PRD-SYS-6`, [SRS](../03-architecture/srs.md)). Accessibility is a brand value, not a checkbox ([Brand Identity §11](./brand-identity.md)).

### 2.1 Standing rules
- **Semantic HTML first.** Real `button`, `a`, `nav`, `main`, headings in order; ARIA only to fill genuine gaps, never to replace semantics.
- **Keyboard operability (`PRD-SYS-6`, [M13](../00-overview/success-metrics.md)).** Every interactive element is reachable and operable by keyboard; logical tab order; no keyboard traps (except intentional, escapable modal focus traps).
- **Visible focus.** A clear, consistent focus ring (`--color-focus-ring`, [Design System §2.2](./design-system.md)) on every focusable element; never removed without an equally visible replacement.
- **Focus management.** Opening a modal moves focus in and traps it; closing returns focus to the trigger. Route changes move focus to the main heading/region.
- **Color is never the only signal.** Status, errors, and chart data always pair color with text, icon, or pattern (e.g. status badges, FS §1.8).
- **Contrast.** Text and meaningful UI meet AA: ≥ 4.5:1 normal text, ≥ 3:1 large text (≥24px or ≥19px bold) and essential non-text/UI. See §2.3.
- **Labels & names.** Every control has an accessible name; icon-only controls carry `aria-label`; inputs have associated `label`s; errors are programmatically associated.
- **Live regions.** Toasts, async status, and validation use appropriate `aria-live` so screen-reader users get feedback ([M6](../00-overview/success-metrics.md)).
- **Reduced motion.** See §3.3.
- **Touch target size.** ≥ 44px (also a WCAG 2.5.5 best practice).

### 2.2 Component-level expectations
Built on [Radix](../03-architecture/technical-specifications.md) primitives (which solve focus/ARIA), but each composite must still be verified: Rating (slider semantics, value text), Rail (keyboard scroll, off-screen item handling), Charts (text alternatives / data tables), Modals (trap + restore), SearchField (combobox semantics for suggestions).

### 2.3 Contrast verification (gate for Design System lock)
This document owns verification of the [Design System §2](./design-system.md) palette. Before the Design System is "final-for-implementation," every default pairing is checked:
- `--text-primary` on `--color-bg-base` / `--bg-surface` / `--bg-elevated` → ≥ 4.5:1.
- `--text-secondary` on the same surfaces → ≥ 4.5:1 (this is the most likely to fail; adjust `--gray-400` lighter if needed).
- White/label text on `--color-accent`, `--color-highlight`, status colors → ≥ 4.5:1 (or ≥3:1 for large/bold); where a pairing fails, use the `-600` primitive or darker text.
- Focus ring vs. adjacent backgrounds → ≥ 3:1.
Any failing value is corrected here and the corrected value reflected back into the Design System via a tracked revision.

### 2.4 Accessibility checklist (per screen — "done" gate)
A screen is not done until:
- [ ] Operable by keyboard alone, logical order, visible focus throughout
- [ ] All four states accessible (loading/empty/error/offline), with screen-reader-announced status changes
- [ ] All controls named; icon-only controls labeled
- [ ] No color-only information
- [ ] Contrast verified for all text/UI on the screen
- [ ] Reduced-motion respected
- [ ] Touch targets ≥ 44px; hover affordances have touch equivalents
- [ ] Headings structured; landmarks present
- [ ] Tested with a screen reader on the primary flow

---

## 3. Motion

Motion is cinematic and purposeful ([Brand Identity §7](./brand-identity.md)); it orients, confirms, or delights — never decorates, never delays.

### 3.1 Rules
- **Purpose required.** Every animation must orient (transitions), confirm (feedback), or delight (signature moments). If it does none, remove it ([Less Is More](../00-overview/product-principles.md)).
- **Never block input (`M8`).** Animations are interruptible; the UI stays responsive during them ([M8](../00-overview/success-metrics.md)).
- **Performant only.** Animate `transform` and `opacity` only; avoid animating layout-affecting properties. Target ~60fps ([M9](../00-overview/success-metrics.md)).
- **Token-driven.** Use the motion tokens ([Design System §6](./design-system.md)); no ad-hoc durations/easings.
- **Consistent motion language.** Interactions that communicate the **same type of feedback share the same motion** (duration + easing) across the whole app. For example, **poster hover, card hover, and button hover** all use the same hover motion; and **selection, success, removal, expansion, and collapse** are each internally consistent everywhere they occur. Deviate only intentionally, and only when there is a measurable UX benefit. This is what makes WatchVerse feel like one cohesive product ([Consistency Above All](../00-overview/product-principles.md)).

### 3.2 Motion vocabulary
| Moment | Motion | Token |
| --- | --- | --- |
| Hover/press feedback | Subtle scale/opacity | `--duration-fast` |
| State change (status, rating) | Quick confirm | `--duration-base` |
| Page / route transition | Fade/slide | `--duration-slow` |
| Shared element (poster grid → detail) | Framer `layoutId` shared transition | `--duration-slow` |
| Cinema Mode reveal | Spin → settle → reveal | `--duration-cinematic` |
| Achievement unlock | Celebratory reveal | `--duration-cinematic` |
| Toast in/out | Slide + fade | `--duration-base` |

Signature moments (Cinema Mode, achievements) are **rationed** so they stay special.

### 3.3 Reduced-motion policy (non-negotiable)
- The app honors `prefers-reduced-motion` and the in-app reduced-motion setting (`PRD-SET-4`, default = OS preference, manual override).
- When reduced motion is active: **all non-essential motion is removed**; transitions become instant state changes; signature reveals show their end state without animation; shimmer/auto-playing motion is disabled.
- Essential feedback remains (it just appears without animated movement) so usability and feedback ([M6](../00-overview/success-metrics.md)) are never lost.
- This is verified per screen in the §2.4 checklist and tracked as [M14](../00-overview/success-metrics.md).

---

## 4. How these standards are enforced
- **Per-screen "done" gate:** the §2.4 accessibility checklist plus the four-state contract (FS §1.1) must pass before a screen is considered complete ([Quality Over Quantity](../00-overview/product-principles.md)).
- **Automated + manual testing:** contrast and a11y linting, keyboard walkthroughs, and screen-reader spot-checks per the [Testing Strategy](../04-engineering/testing-strategy.md).
- **Design System gate:** §2.3 contrast verification must pass before the [Design System](./design-system.md) is locked for implementation.

---

### Related documents
- [Design System](./design-system.md) — the tokens and components these rules apply to (and whose contrast this doc verifies)
- [Brand Identity](./brand-identity.md) — the philosophy behind these rules
- [Functional Specifications](../01-product/functional-specifications.md) — the four-state contract and per-feature behavior these rules cut across
- [Success Metrics](../00-overview/success-metrics.md) — M5, M6, M8, M9, M13, M14 measured here
- [SRS](../03-architecture/srs.md) — the formal accessibility/performance requirements
