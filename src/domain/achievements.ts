import { computeStats } from './stats';
import type { LibraryEntry } from './types';

/** The signals achievements are evaluated against — all from local data. */
export interface AchievementContext {
  totalTracked: number;
  totalCompleted: number;
  completedShows: number;
  hasReview: boolean;
  collectionsCount: number;
  tagsCount: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // mapped to a Lucide icon in the UI (keeps the domain pure)
  rule: (ctx: AchievementContext) => boolean;
}

/**
 * A small, high-quality, declarative catalog. Rules are pure predicates over the
 * context; understandable, not arbitrary.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-title',
    title: 'First Tracked',
    description: 'Add your first title.',
    icon: 'plus',
    rule: (c) => c.totalTracked >= 1,
  },
  {
    id: 'first-completed',
    title: 'First Watch',
    description: 'Complete your first title.',
    icon: 'check',
    rule: (c) => c.totalCompleted >= 1,
  },
  {
    id: 'ten-completed',
    title: 'Double Digits',
    description: 'Complete ten titles.',
    icon: 'trophy',
    rule: (c) => c.totalCompleted >= 10,
  },
  {
    id: 'first-review',
    title: 'Critic',
    description: 'Write your first review.',
    icon: 'pen',
    rule: (c) => c.hasReview,
  },
  {
    id: 'first-show',
    title: 'Binger',
    description: 'Complete your first TV show.',
    icon: 'tv',
    rule: (c) => c.completedShows >= 1,
  },
  {
    id: 'first-collection',
    title: 'Curator',
    description: 'Create your first collection.',
    icon: 'library',
    rule: (c) => c.collectionsCount >= 1,
  },
  {
    id: 'first-tag',
    title: 'Labeler',
    description: 'Create your first tag.',
    icon: 'tag',
    rule: (c) => c.tagsCount >= 1,
  },
];

export function buildAchievementContext(
  entries: LibraryEntry[],
  collectionsCount: number,
  tagsCount: number,
): AchievementContext {
  const stats = computeStats(entries);
  return {
    totalTracked: stats.totalTracked,
    totalCompleted: stats.totalCompleted,
    completedShows: stats.showsWatched,
    hasReview: entries.some((e) => e.review !== null),
    collectionsCount,
    tagsCount,
  };
}

/** Pure, deterministic: achievements whose rule passes and aren't already unlocked. */
export function evaluateAchievements(
  ctx: AchievementContext,
  unlockedIds: ReadonlySet<string>,
): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id) && a.rule(ctx));
}
