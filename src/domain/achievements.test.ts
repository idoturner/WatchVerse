import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENTS,
  buildAchievementContext,
  evaluateAchievements,
  type AchievementContext,
} from './achievements';
import { createLibraryEntry } from './library';
import type { LibraryEntry } from './types';

const baseCtx: AchievementContext = {
  totalTracked: 0,
  totalCompleted: 0,
  completedShows: 0,
  hasReview: false,
  collectionsCount: 0,
  tagsCount: 0,
};

const ids = (defs: { id: string }[]) => defs.map((d) => d.id).sort();

describe('evaluateAchievements', () => {
  it('unlocks nothing for an empty context', () => {
    expect(evaluateAchievements(baseCtx, new Set())).toEqual([]);
  });

  it('is deterministic — same context yields the same unlocks', () => {
    const ctx = { ...baseCtx, totalTracked: 1, totalCompleted: 1 };
    const a = ids(evaluateAchievements(ctx, new Set()));
    const b = ids(evaluateAchievements(ctx, new Set()));
    expect(a).toEqual(b);
    expect(a).toEqual(['first-completed', 'first-title']);
  });

  it('applies each rule threshold', () => {
    const ctx: AchievementContext = {
      totalTracked: 12,
      totalCompleted: 10,
      completedShows: 1,
      hasReview: true,
      collectionsCount: 1,
      tagsCount: 1,
    };
    expect(ids(evaluateAchievements(ctx, new Set()))).toEqual(ids(ACHIEVEMENTS));
  });

  it('requires ten completed for the double-digits achievement', () => {
    const ctx = { ...baseCtx, totalCompleted: 9 };
    expect(ids(evaluateAchievements(ctx, new Set()))).not.toContain('ten-completed');
    expect(ids(evaluateAchievements({ ...baseCtx, totalCompleted: 10 }, new Set()))).toContain(
      'ten-completed',
    );
  });

  it('never re-unlocks an already-earned achievement', () => {
    const ctx = { ...baseCtx, totalTracked: 1 };
    expect(evaluateAchievements(ctx, new Set(['first-title']))).toEqual([]);
  });
});

describe('buildAchievementContext', () => {
  it('derives signals from local entries and counts', () => {
    const movie = (over: Partial<LibraryEntry>): LibraryEntry => ({
      ...createLibraryEntry({
        tmdbId: Math.floor(Math.random() * 1e6),
        mediaType: 'movie',
        snapshot: { title: 'M', posterPath: null, releaseYear: 2020 },
      }),
      ...over,
    });

    const entries: LibraryEntry[] = [
      movie({ status: 'completed', review: 'Loved it' }),
      movie({ status: 'want' }),
    ];
    const ctx = buildAchievementContext(entries, 2, 3);
    expect(ctx.totalTracked).toBe(2);
    expect(ctx.totalCompleted).toBe(1);
    expect(ctx.hasReview).toBe(true);
    expect(ctx.collectionsCount).toBe(2);
    expect(ctx.tagsCount).toBe(3);
  });
});
