---
title: Anti-Goals
status: Approved
version: 1.0
last-updated: 2026-06-27
owner: WatchVerse Project
folder: 00-overview
related:
  - ./product-vision.md
  - ./product-principles.md
  - ../01-product/prd.md
---

# Anti-Goals

> **Purpose.** This document defines what WatchVerse intentionally is **not**. Anti-goals are as important as goals: they are the firewall that protects the product vision from well-meaning scope creep over time.
>
> **Owns:** explicit non-scope and the reasoning behind it.
> **Does not own:** what the product *does* ([PRD](../01-product/prd.md)) or deferred-but-planned features (those live in the [Roadmap](../05-delivery/development-roadmap.md)).

**An anti-goal is a deliberate, principled refusal — not a "not yet."** Features that are merely deferred (e.g. per-episode tracking, command palette, cloud sync) are *not* anti-goals; they appear in the [Roadmap](../05-delivery/development-roadmap.md). The items below are things WatchVerse should resist even when it becomes technically easy to add them.

---

## WatchVerse is NOT a social network

No followers. No following. No friend graphs. No public profiles. No activity feeds of other people. No likes on other users' content.

**Why.** WatchVerse is a *personal cinema* — a private, single-player journal of one person's relationship with film and television. The moment social mechanics enter, the product's center of gravity shifts from personal reflection to performance and comparison. That is a fundamentally different product (and a far larger, riskier one). This directly serves [Less Is More](./product-principles.md) and the [Product Vision](./product-vision.md).

## No comments, chat, or messaging

No comment threads. No direct messages. No discussion boards. No replies.

**Why.** These require moderation, abuse handling, and notification systems, and they pull the product toward community management — explicitly out of scope. The user's [Reviews](./glossary.md#r) are *private* by design.

## No advertisements

No banner ads. No sponsored placements. No affiliate clutter dressed up as recommendations.

**Why.** Ads are incompatible with a premium, cinematic, distraction-free experience. The [Recommended For You](./glossary.md#r) section is driven only by the user's own library — never by paid placement.

## No unnecessary notifications

No re-engagement nudges. No "you haven't watched in a while" guilt. No badges demanding attention. Notifications (if ever added) must be user-requested and genuinely useful.

**Why.** Attention-harvesting patterns are the opposite of a calm, respectful product. WatchVerse should be opened because the user *wants* to, not because it nagged them.

## No feature bloat

No feature is added merely because a competitor has it or because it is technically possible. Every feature must earn its place against [Quality Over Quantity](./product-principles.md) and [Less Is More](./product-principles.md).

**Why.** Bloat is paid for forever — in maintenance, in cognitive load for the user, and in diluted identity. A focused product that does a few things beautifully beats a sprawling one that does many things adequately.

## No unnecessary complexity

No premature architecture for scale we do not have. No configuration the user did not ask for. No abstractions without at least two concrete uses.

**Why.** Complexity is a tax on every future change. [Build For Tomorrow](./product-principles.md) means anticipating growth at the *boundaries* (the [Repository](./glossary.md#r), theme tokens), not gold-plating the interior.

## Not a piracy or streaming tool

WatchVerse does not stream, host, link to, or help users obtain content. It tracks what a user watches; it is not a place to *watch*.

**Why.** It is a tracking and curation product. Streaming is legally, technically, and ethically a different universe, and conflating the two would compromise the product's legitimacy and its [TMDB](./glossary.md#t) terms of use.

## Not an algorithmic, AI-driven recommendation engine (in v1.0)

[Recommended For You](./glossary.md#r) is transparent and rules-based, derived from the user's own data. WatchVerse does not, in Version 1.0, build opaque machine-learning recommendation models or send user data to third-party AI services.

**Why.** Transparency and privacy ([Your Data Is Sacred](./product-principles.md)) outweigh marginal recommendation accuracy at this stage. This is a *current-version* stance, recorded so any future change is a deliberate, reviewed decision rather than a drift.

## Not account-gated in v1.0

No mandatory sign-up. No login wall between the user and their library. The product is fully usable the moment it loads.

**Why.** Local-first means the user owns their data on their device without an account. Accounts arrive (if at all) only alongside optional cloud sync, as an enhancement — never as a gate.

---

## How to use this document
When evaluating any new idea, ask: *does this move WatchVerse toward one of the anti-goals above?* If yes, the default answer is **no**, and overriding it requires an explicit, reasoned decision recorded as an [ADR](../03-architecture/decisions/). Anti-goals can change — but only on purpose, never by accident.

---

### Related documents
- [Product Principles](./product-principles.md) — the values these boundaries enforce
- [Product Vision](./product-vision.md) — the vision these boundaries protect
- [Development Roadmap](../05-delivery/development-roadmap.md) — for deferred-but-planned features (not anti-goals)
