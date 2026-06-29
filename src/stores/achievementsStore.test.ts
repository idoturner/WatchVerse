import { beforeEach, describe, expect, it } from 'vitest';
import { getRepository, setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import type { AchievementContext } from '@/domain/achievements';
import { useAchievementsStore } from './achievementsStore';

const as = () => useAchievementsStore.getState();

const ctx = (over: Partial<AchievementContext> = {}): AchievementContext => ({
  totalTracked: 0,
  totalCompleted: 0,
  completedShows: 0,
  hasReview: false,
  collectionsCount: 0,
  tagsCount: 0,
  ...over,
});

describe('achievementsStore', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useAchievementsStore.setState({ unlocked: {}, hydrated: true });
  });

  it('unlocks, persists, and returns newly-earned achievements', async () => {
    const newly = await as().evaluate(ctx({ totalTracked: 1 }));
    expect(newly.map((a) => a.id)).toContain('first-title');
    expect(as().unlocked['first-title']).toBeDefined();

    const persisted = await getRepository().getAchievements();
    expect(persisted.map((r) => r.achievementId)).toContain('first-title');
  });

  it('is idempotent — re-evaluating the same context unlocks nothing new', async () => {
    await as().evaluate(ctx({ totalTracked: 1 }));
    const again = await as().evaluate(ctx({ totalTracked: 1 }));
    expect(again).toEqual([]);
  });

  it('hydrates previously-unlocked records', async () => {
    await getRepository().upsertAchievement({
      achievementId: 'first-title',
      unlockedAt: '2026-01-01T00:00:00.000Z',
    });
    useAchievementsStore.setState({ unlocked: {}, hydrated: false });
    await as().hydrate();
    expect(as().unlocked['first-title']).toBeDefined();
  });
});
