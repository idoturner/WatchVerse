import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { createLibraryEntry } from '@/domain/library';
import type { LibraryEntry, MediaType } from '@/domain/types';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { useActivityStore } from '@/stores/activityStore';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { useTagsStore } from '@/stores/tagsStore';
import { useAchievementWatcher } from './useAchievementWatcher';

function completed(title: string, mediaType: MediaType): LibraryEntry {
  return {
    ...createLibraryEntry({
      tmdbId: Math.floor(Math.random() * 1e6),
      mediaType,
      snapshot: { title, posterPath: null, releaseYear: 2020 },
    }),
    status: 'completed',
  };
}

describe('useAchievementWatcher', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    const seed = completed('Dune', 'movie');
    useLibraryStore.setState({ entries: { [seed.id]: seed }, hydrated: true, error: null });
    useCollectionsStore.setState({ items: {}, hydrated: true, error: null });
    useTagsStore.setState({ items: {}, hydrated: true, error: null });
    useAchievementsStore.setState({ unlocked: {}, hydrated: true });
    useActivityStore.setState({ items: [], hydrated: true });
  });

  it('reconciles pre-existing data silently, then logs activity only for genuinely new unlocks', async () => {
    renderHook(() => useAchievementWatcher());

    // First pass reconciles historical unlocks (e.g. a completed movie) into persistence...
    await waitFor(() => {
      expect(useAchievementsStore.getState().unlocked['first-completed']).toBeDefined();
    });
    // ...without flooding the activity timeline with backfill noise.
    expect(useActivityStore.getState().items.some((a) => a.type === 'achievement_unlocked')).toBe(
      false,
    );

    // A genuinely new unlock after the app is in use: complete a TV show (→ "Binger").
    const show = completed('The Wire', 'tv');
    act(() => {
      useLibraryStore.setState((s) => ({ entries: { ...s.entries, [show.id]: show } }));
    });

    await waitFor(() => {
      expect(useAchievementsStore.getState().unlocked['first-show']).toBeDefined();
    });
    expect(
      useActivityStore
        .getState()
        .items.some((a) => a.type === 'achievement_unlocked' && a.refId === 'first-show'),
    ).toBe(true);
  });
});
