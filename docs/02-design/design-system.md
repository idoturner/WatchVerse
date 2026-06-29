---
title: Design System
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 02-design
related:
  - ./brand-identity.md
  - ./ux-accessibility-motion.md
  - ../01-product/functional-specifications.md
  - ../03-architecture/technical-specifications.md
  - ../04-engineering/coding-standards.md
---

# Design System

> **Purpose.** This is the concrete, implementable design language of WatchVerse: the design tokens (color, type, spacing, radius, elevation, motion, z-index, breakpoints), the theme architecture, and the component inventory with variants and states. It turns the [Brand Identity](./brand-identity.md) into specifications an engineer can build directly.
>
> **Owns:** token values, the theme model, and component specifications (purpose, variants, states, anatomy).
> **Does not own:** brand philosophy (see [Brand Identity](./brand-identity.md)); responsive/accessibility/motion *rules and policy* (see [UX, Accessibility & Motion](./ux-accessibility-motion.md)); implementation conventions (see [Coding Standards](../04-engineering/coding-standards.md)).

> **Status of values.** The token values below are the **specification baseline** for Cinema Dark. All color pairings must pass the contrast checklist in [UX, Accessibility & Motion](./ux-accessibility-motion.md) before this document is treated as final-for-implementation; any value that fails is adjusted there and reflected back here via a tracked revision. Hex values are starting points chosen to meet WCAG 2.1 AA, not yet independently verified.

---

## 1. Token philosophy

Tokens are the single source of visual truth. **Components reference semantic tokens only — never raw hex, never magic numbers.** This is what makes the UI consistent ([Consistency Above All](../00-overview/product-principles.md)) and makes [theming](#3-theme-architecture) a one-line change.

Two layers:
1. **Primitive tokens** — the raw palette/scale (e.g. `--red-500: #E5484D`). Not used directly by components.
2. **Semantic tokens** — meaning-based aliases that components consume (e.g. `--color-accent`, `--color-bg-surface`, `--text-secondary`). A theme is just a different mapping of semantic → primitive.

Naming convention: `--<category>-<role>[-<state>]` (e.g. `--color-accent-hover`, `--text-secondary`, `--space-4`). Defined as CSS custom properties in `styles/tokens.css`; Tailwind's config maps utilities onto these tokens (see [Technical Specifications](../03-architecture/technical-specifications.md)).

---

## 2. Color tokens (Cinema Dark)

### 2.1 Primitive palette
| Token | Value | Notes |
| --- | --- | --- |
| `--charcoal-900` | `#0E0E11` | App base background (the dimmed theatre) |
| `--charcoal-800` | `#16161B` | Card / surface |
| `--charcoal-700` | `#1E1E25` | Elevated surface (modals, popovers) |
| `--charcoal-600` | `#2A2A33` | Subtle borders / dividers |
| `--charcoal-500` | `#3A3A45` | Stronger borders / disabled surfaces |
| `--white` | `#F5F5F7` | Primary text / content on dark |
| `--gray-400` | `#9A9AA5` | Secondary text (muted, warm) |
| `--gray-500` | `#6E6E78` | Tertiary text / placeholders |
| `--red-500` | `#E5484D` | Cinema red — accent |
| `--red-600` | `#C2342E` | Red interactive/pressed (text-on-red contexts) |
| `--gold-500` | `#E6B450` | Gold — ratings, achievements, highlights |
| `--gold-600` | `#C9952F` | Gold pressed/border |
| `--orange-500` | `#F0894C` | Soft orange — secondary accent |
| `--green-500` | `#4FB477` | Success / "Completed" status |
| `--blue-500` | `#5A9BD6` | Info / "Watching" status |
| `--amber-500` | `#E0A33E` | Warning / "On Hold" status |

### 2.2 Semantic tokens (what components use)
| Semantic token | Maps to | Purpose |
| --- | --- | --- |
| `--color-bg-base` | `--charcoal-900` | Page background |
| `--color-bg-surface` | `--charcoal-800` | Cards, rails |
| `--color-bg-elevated` | `--charcoal-700` | Modals, menus, popovers |
| `--color-border-subtle` | `--charcoal-600` | Dividers, card borders |
| `--color-border-strong` | `--charcoal-500` | Inputs, emphasis borders |
| `--text-primary` | `--white` | Headings, body |
| `--text-secondary` | `--gray-400` | Supporting text |
| `--text-tertiary` | `--gray-500` | Captions, placeholders |
| `--color-accent` | `--red-500` | Primary actions, active state |
| `--color-accent-hover` | `--red-600` | Accent hover/press |
| `--color-highlight` | `--gold-500` | Ratings, achievements |
| `--color-accent-secondary` | `--orange-500` | Gentle secondary emphasis |
| `--color-focus-ring` | `--gold-500` | Visible focus indicator |

> **Gold is reserved.** `--color-highlight` (gold) communicates **something earned or exceptional** only — ratings, achievement badges, top favorites, premium highlights, and celebratory moments. Gold must **never** represent future intent or ordinary state (e.g. it is not used for "Want to Watch"). This keeps gold meaningful; if gold is everywhere, accomplishment stops feeling special.

### 2.3 Watch-status colors (drives `PRD-SYS-11` status badges)
A fixed, semantic mapping so a status looks identical everywhere it appears ([FS §1.8](../01-product/functional-specifications.md)). Each status also has a **fixed icon** so the color/icon/label triad is consistent app-wide (see §2.4):

| Status | Token | Base color | Fixed icon (concept) |
| --- | --- | --- | --- |
| Want to Watch | `--status-want` | `--orange-500` | bookmark / plus |
| Watching | `--status-watching` | `--blue-500` | play |
| Completed | `--status-completed` | `--green-500` | check |
| On Hold | `--status-onhold` | `--amber-500` | pause |
| Dropped | `--status-dropped` | `--gray-500` | x / minus |

"Want to Watch" uses **soft orange**, not gold — gold is reserved for earned/exceptional concepts (§2.2).

### 2.4 Status communication rule (Design System rule, not just an a11y recommendation)
A watch status is **always** communicated using **all three** of the following, together, everywhere it appears:
1. **Color** (the §2.3 status token),
2. **Icon** (the fixed per-status icon), and
3. **Text label** (the status name).

Status must **never** rely on only one or two of these signals. This is a binding Design System rule (it strengthens, and goes beyond, the accessibility "never color-only" requirement in [UX, Accessibility & Motion](./ux-accessibility-motion.md)). In extremely space-constrained contexts the label may be provided via an always-available accessible name and tooltip, but color **and** icon must both be visible, and the label must be reachable — never color alone.

---

## 3. Theme architecture

A **theme** is a named set of values for the **semantic** tokens. Cinema Dark ships in v1.0; the architecture is future-ready (`PRD-SET-5`) for Midnight Blue and OLED Black with **no structural change**.

- The active theme is applied via a `data-theme="cinema-dark"` attribute on the document root; switching it swaps the semantic→primitive mapping. No component changes, no logic re-render.
- Themes are registered in `config/themes.ts` (`id`, `label`, value map). Adding a theme = appending an entry.
- The theme is applied **before first paint** (from persisted settings) to avoid a flash.
- OLED Black is essentially Cinema Dark with `--color-bg-base: #000000` and reduced elevation — proof the abstraction is right.

The theme switcher UI is deferred to Phase 9 (only one theme exists at MVP), but the token plumbing exists from Phase 1.

---

## 4. Spacing, radius, elevation

### 4.1 Spacing scale (4px base)
`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 24px` · `--space-6: 32px` · `--space-8: 48px` · `--space-10: 64px` · `--space-12: 96px`.
No spacing value outside this scale is permitted. Generous spacing is a brand signal ([Brand Identity §5](./brand-identity.md)).

### 4.2 Radius
`--radius-sm: 6px` (chips, badges, inputs) · `--radius-md: 10px` (cards, buttons) · `--radius-lg: 16px` (modals, large surfaces) · `--radius-full: 9999px` (pills, avatars). Cinematic = soft, not bubbly — medium radii dominate.

### 4.3 Elevation
On dark UIs, depth comes primarily from **background lift + subtle border**, with restrained shadow:
`--elevation-0` flat (base) · `--elevation-1` surface (`bg-surface` + `border-subtle`) · `--elevation-2` raised (`bg-elevated` + soft shadow) · `--elevation-3` overlay/modal (`bg-elevated` + stronger shadow + backdrop scrim). Shadows are soft and low-opacity; never heavy.

---

## 5. Typography

### 5.1 Families
- **Display** (`--font-display`): **Sora** — a geometric sans with quiet cinematic elegance for headings and title cards; fallback `system-ui, sans-serif`. Chosen for its balance of readability, timelessness, international support, performance, and maintainability.
- **Body** (`--font-body`): **Inter** — a clean, highly legible neutral sans; fallback `system-ui, -apple-system, sans-serif`.
- **Numeric:** body font with `font-variant-numeric: tabular-nums` for stats/ratings.

*(Final implementation details — weights to ship, self-hosting for performance and privacy — confirmed in [Technical Specifications](../03-architecture/technical-specifications.md).)*

### 5.2 Type scale
| Token | Size / line-height | Use |
| --- | --- | --- |
| `--text-display` | 40 / 48 | Hero titles, Cinema Mode |
| `--text-h1` | 32 / 40 | Page titles |
| `--text-h2` | 24 / 32 | Section headers |
| `--text-h3` | 20 / 28 | Card titles, sub-sections |
| `--text-body` | 16 / 24 | Default body |
| `--text-sm` | 14 / 20 | Secondary text, metadata |
| `--text-xs` | 12 / 16 | Captions, badges |

Fluid scaling between breakpoints via `clamp()` where helpful. Weights: 400 (body), 500 (medium/labels), 600–700 (headings). Hierarchy comes from scale and weight, not color ([Brand Identity §8](./brand-identity.md)).

---

## 6. Motion tokens
*(Usage rules and reduced-motion policy: [UX, Accessibility & Motion](./ux-accessibility-motion.md).)*

| Token | Value | Use |
| --- | --- | --- |
| `--duration-fast` | 120ms | Hover/press, small feedback |
| `--duration-base` | 200ms | Most transitions |
| `--duration-slow` | 320ms | Page/shared-element transitions |
| `--duration-cinematic` | 600ms | Signature reveals (Cinema Mode, achievements) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Enter/exit |
| `--ease-spring` | spring(stiffness, damping) via Framer | Physical, playful motion |

Only `transform` and `opacity` are animated for performance ([UX, Accessibility & Motion](./ux-accessibility-motion.md)). Under reduced-motion, durations collapse to ~0 and animations become instant state changes.

---

## 7. Z-index, breakpoints, icons

- **Z-index scale:** `--z-base: 0` · `--z-rail-controls: 10` · `--z-sticky-nav: 100` · `--z-dropdown: 200` · `--z-modal: 300` · `--z-toast: 400`. No ad-hoc z-index values.
- **Breakpoints** (mobile-first; full responsive strategy in [UX, Accessibility & Motion](./ux-accessibility-motion.md)): `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
- **Icons:** Lucide React (per [Brand Identity §9](./brand-identity.md)). Sizes `--icon-sm: 16` · `--icon-md: 20` · `--icon-lg: 24`. Consistent 1.5–2px stroke; icon-only controls require an accessible label.

---

## 8. Component inventory

Each component is built once in `shared/ui` and reused everywhere (promotion rule: used on a second screen ⇒ shared component). Every interactive component is built on accessible primitives ([Radix](../03-architecture/technical-specifications.md)) and must define all relevant states: **default, hover, focus-visible, active/pressed, disabled, loading**.

### 8.0 Interaction contract (mandatory for every interactive component)
Beyond visual states, **every interactive component specification must define behavior across all four interaction axes** — **Mouse, Keyboard, Touch, and Focus** — not only states. To keep this maintainable and DRY (per the project's architecture philosophy: simplicity and predictability over repetition), the following **default contract** applies to *all* interactive components; each component spec documents only its **deviations** from it:

- **Mouse:** hover affordance (per motion tokens §6), click/press feedback, appropriate cursor; hover-only reveals are gated to pointer devices.
- **Keyboard:** reachable in logical tab order; operable via Enter/Space (activation), arrow keys (sliders, menus, tabs, rails), Esc (dismiss overlays); no keyboard traps except intentional, escapable modal focus.
- **Touch:** target ≥ 44px; a touch equivalent for every hover affordance (tap or long-press); never relies on hover or tooltip for essential information.
- **Focus:** visible focus ring (`--color-focus-ring`); focus moves into overlays on open and returns to the trigger on close; focus is never silently removed.

Full cross-cutting rules: [UX, Accessibility & Motion](./ux-accessibility-motion.md).

### 8.1 Foundational
| Component | Purpose | Variants | Key states / notes |
| --- | --- | --- | --- |
| **Button** | Primary interaction | `primary` (red), `secondary` (surface), `ghost` (transparent), `gold` (reward), `danger` | All six states; loading shows spinner + disables; always has focus ring; min target 44px (touch) |
| **IconButton** | Icon-only action | sizes sm/md/lg | Requires `aria-label`; same states as Button |
| **Card** | Content surface | `surface`, `elevated`, `interactive` | Interactive cards have hover lift + focus ring |
| **Poster** | The hero primitive | sizes xs–xl; `grid`, `detail` | Original artwork aspect preserved — never stretched, distorted, or arbitrarily cropped (§9.1); lazy-load + blur-up; skeleton; hover zoom + quick-action overlay (pointer, with touch equivalent); missing-art placeholder |
| **StatusBadge** | Watch status everywhere (`PRD-SYS-11`) | one per status (§2.3) | **Always color + icon + text label together** (§2.4 rule); small, legible on posters; updates optimistically |
| **Chip / FilterChip** | Filters, tags | `default`, `selected`, `removable` | Keyboard operable; selected state clearly distinct |
| **Skeleton** | Loading placeholder | shapes: text, poster, rail, card | Mirrors final layout; respects reduced-motion (no shimmer if set) |

### 8.2 Inputs & forms
| Component | Purpose | Notes |
| --- | --- | --- |
| **Input / Textarea** | Text entry, Review (≤500, live counter) | Label + error + helper; Textarea enforces 500-char cap (`PRD-REV-1/2`) |
| **Select / Combobox** | Filters, sort | Radix-backed; keyboard + type-ahead |
| **Rating** | 10-pt, 0.5 steps (`RATE`) | Radix Slider base; mouse/touch/keyboard (arrows ±0.5, Home/End); animated fill; clearable; accessible value label |
| **Toggle / Switch** | Settings | Labeled; reflects on/off accessibly |
| **SearchField** | Global search entry | Debounced; shows recent searches when empty; clear button; full keyboard |

### 8.3 Overlays & feedback
| Component | Purpose | Notes |
| --- | --- | --- |
| **Modal / Dialog** | Focused tasks, confirms | Radix; focus trap, ESC, scrim; responsive → Drawer on mobile |
| **Drawer / BottomSheet** | Mobile overlays | Same content model as Modal |
| **ConfirmDialog** | Destructive confirms (`PRD-SYS-5`) | Clear copy, honest, undo-aware (FS §1.4) |
| **Tooltip / Popover** | Hints, quick info | Radix; not the only source of essential info |
| **Tabs** | Sectioned content | Radix; keyboard arrows |
| **Toast** | Action feedback + Undo | Sonner; promise-aware; Undo affordance for destructive actions; reduced-motion friendly |
| **Menu / Dropdown** | Contextual actions | Radix; keyboard navigable |

### 8.4 Composite / layout
| Component | Purpose | Notes |
| --- | --- | --- |
| **Rail** | Horizontal poster carousel (Home, Similar) | Own four states (FS §1.1); keyboard scrollable; lazy-loads items |
| **TitleGrid** | Responsive poster grid (Library, Search) | `auto-fill` + `minmax`; virtualized > ~100 items (`PRD-LIB-9`) |
| **EmptyState** | Guiding empty views | Illustration slot + headline + body + primary action; brand voice (FS §1.1) |
| **ErrorState** | Recoverable errors | Friendly message + Retry; offline variant; never raw errors |
| **OfflineBanner** | Connectivity notice | Calm, scoped; non-blocking (FS §1.5) |
| **StatCard / Chart** | Statistics (`STAT`) | Accessible charts (labels, non-color-only, keyboard legend); tabular figures |
| **AchievementCard** | Achievement display + unlock | Locked/unlocked + progress; celebratory unlock (reduced-motion aware) |
| **AppShell / Navigation** | Frame + nav | Bottom tab bar (mobile) / sidebar or top nav (desktop); search always reachable (`PRD-GLOB-1`) |

### 8.5 Action hierarchy
Within a single visual context (a screen, card, modal, or toolbar) there should normally be **only one Primary action**. All additional actions use **secondary, ghost, or contextual** styles. Use more than one Primary action only when multiple, genuinely equally-important actions truly coexist — which is rare.

This enforces [Less Is More](../00-overview/product-principles.md): a clear hierarchy, reduced cognitive load, better visual rhythm, and one obvious next step ([M5 — one clear primary action per screen](../00-overview/success-metrics.md)).

---

## 9. Density & poster sizing
- **Poster sizes** map to a token set (xs–xl) and to TMDB image widths so the right resolution is served per context and viewport (image strategy in [UX, Accessibility & Motion](./ux-accessibility-motion.md) and [TMDB Integration](../03-architecture/tmdb-integration.md)).
- **Density** preference (`PRD-SET-3`) adjusts poster size/grid gap within the defined scale — it never introduces off-scale values.

### 9.1 Poster artwork integrity (cinema-first, non-negotiable)
Movie and TV artwork is the emotional centerpiece of WatchVerse ([Poster-First](../00-overview/product-principles.md), [Brand Identity §10](./brand-identity.md)). Therefore:
- The **original poster aspect ratio is always preserved** (TMDB posters are 2:3).
- Posters are **never stretched**, **never distorted**, and **never arbitrarily cropped**.
- When space is constrained, the **layout adapts around the artwork** (adjust grid columns, gaps, or container sizing) rather than altering the artwork itself.
- Missing artwork uses a tasteful, on-brand placeholder — never a broken or warped image.

---

## 10. Governance
- New visual values must be added as tokens, never inlined.
- New components live in `shared/ui` with all required states (and the §8.0 interaction contract) before use.
- **Visual inconsistency is design debt.** Before introducing any new color, spacing rule, typography treatment, animation, component variant, or button style, the existing Design System must be evaluated first. New patterns are introduced **only** when existing ones genuinely cannot solve the problem — and then they are added as tokens/components, never as one-offs. (When choosing among valid options, prefer cohesion over novelty — see [Brand Identity §5](./brand-identity.md).)
- Changes to this system after approval follow the documentation-stability rule (propose → [ADR](../03-architecture/decisions/) → revise). See [CONTRIBUTING](../../CONTRIBUTING.md).

---

### Related documents
- [Brand Identity](./brand-identity.md) — the philosophy these tokens express
- [UX, Accessibility & Motion](./ux-accessibility-motion.md) — contrast verification, responsive rules, motion policy
- [Functional Specifications](../01-product/functional-specifications.md) — component behavior requirements (states, status visibility)
- [Technical Specifications](../03-architecture/technical-specifications.md) — how tokens/components are implemented (Tailwind, Radix, fonts)
