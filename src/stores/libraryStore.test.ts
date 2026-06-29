import { beforeEach, describe, expect, it } from 'vitest';
import { useLibraryStore } from './libraryStore';
import { todayDate } from '@/domain/library';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';

function addInput(title = 'Sample') {
  return {
    tmdbId: 42,
    mediaType: 'movie' as const,
    snapshot: { title, posterPath: null, releaseYear: 2020 },
  };
}

describe('libraryStore', () => {
  beforeEach(() => {
    // Inject a fresh in-memory repository (the async-Repository seam, ADR-001).
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useLibraryStore.setState({ entries: {}, hydrated: false, error: null });
  });

  it('adds a title optimistically and persists it', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput('Dune'));
    expect(Object.values(useLibraryStore.getState().entries)).toHaveLength(1);
    expect(useLibraryStore.getState().entries[entry.id]?.snapshot.title).toBe('Dune');
  });

  it('re-hydrates persisted entries from the repository', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput('Heat'));
    useLibraryStore.setState({ entries: {}, hydrated: false });
    await useLibraryStore.getState().hydrate();
    expect(useLibraryStore.getState().hydrated).toBe(true);
    expect(useLibraryStore.getState().entries[entry.id]?.snapshot.title).toBe('Heat');
  });

  it('removes an entry', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().removeEntry(entry.id);
    expect(Object.values(useLibraryStore.getState().entries)).toHaveLength(0);
  });

  it('updates rating and persists the change', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().setRating(entry.id, 8.5);
    expect(useLibraryStore.getState().entries[entry.id]?.rating).toBe(8.5);

    // Verify persistence by re-hydrating.
    useLibraryStore.setState({ entries: {}, hydrated: false });
    await useLibraryStore.getState().hydrate();
    expect(useLibraryStore.getState().entries[entry.id]?.rating).toBe(8.5);
  });

  it('restores a removed entry (undo) and persists it', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput('Heat'));
    await useLibraryStore.getState().removeEntry(entry.id);
    expect(Object.values(useLibraryStore.getState().entries)).toHaveLength(0);

    await useLibraryStore.getState().restoreEntry(entry);
    expect(useLibraryStore.getState().entries[entry.id]?.snapshot.title).toBe('Heat');

    useLibraryStore.setState({ entries: {}, hydrated: false });
    await useLibraryStore.getState().hydrate();
    expect(useLibraryStore.getState().entries[entry.id]).toBeDefined();
  });

  it('defaults the watch date when status becomes Completed', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().setStatus(entry.id, 'completed');
    expect(useLibraryStore.getState().entries[entry.id]?.watchedAt).toBe(todayDate());
  });

  it('persists review, watch date, and rewatch count', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().setReview(entry.id, '  Great  ');
    await useLibraryStore.getState().setWatchedAt(entry.id, '2020-01-01');
    await useLibraryStore.getState().setRewatchCount(entry.id, 3);

    useLibraryStore.setState({ entries: {}, hydrated: false });
    await useLibraryStore.getState().hydrate();
    const reloaded = useLibraryStore.getState().entries[entry.id];
    expect(reloaded?.review).toBe('Great'); // store normalizes (trims) the review
    expect(reloaded?.watchedAt).toBe('2020-01-01');
    expect(reloaded?.rewatchCount).toBe(3);
  });

  it('clamps the rewatch count to a non-negative integer', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().setRewatchCount(entry.id, -5);
    expect(useLibraryStore.getState().entries[entry.id]?.rewatchCount).toBe(0);
    await useLibraryStore.getState().setRewatchCount(entry.id, 2.9);
    expect(useLibraryStore.getState().entries[entry.id]?.rewatchCount).toBe(2);
  });

  it('sets the current TV season and moves status to watching', async () => {
    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 9,
      mediaType: 'tv',
      snapshot: { title: 'Show', posterPath: null, releaseYear: 2020 },
      status: 'want',
    });
    await useLibraryStore.getState().setCurrentSeason(entry.id, 2);
    const e = useLibraryStore.getState().entries[entry.id];
    expect(e?.tv?.currentSeason).toBe(2);
    expect(e?.status).toBe('watching');
  });

  it('toggles season completion and persists it', async () => {
    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 9,
      mediaType: 'tv',
      snapshot: { title: 'Show', posterPath: null, releaseYear: 2020 },
    });
    await useLibraryStore.getState().toggleSeasonCompleted(entry.id, 1);
    expect(useLibraryStore.getState().entries[entry.id]?.tv?.completedSeasons).toEqual([1]);
    await useLibraryStore.getState().toggleSeasonCompleted(entry.id, 1);
    expect(useLibraryStore.getState().entries[entry.id]?.tv?.completedSeasons).toEqual([]);

    await useLibraryStore.getState().toggleSeasonCompleted(entry.id, 3);
    useLibraryStore.setState({ entries: {}, hydrated: false });
    await useLibraryStore.getState().hydrate();
    expect(useLibraryStore.getState().entries[entry.id]?.tv?.completedSeasons).toEqual([3]);
  });

  it('marks the show completed, setting status and watch date', async () => {
    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 9,
      mediaType: 'tv',
      snapshot: { title: 'Show', posterPath: null, releaseYear: 2020 },
    });
    await useLibraryStore.getState().setShowCompleted(entry.id, true);
    const e = useLibraryStore.getState().entries[entry.id];
    expect(e?.tv?.isShowCompleted).toBe(true);
    expect(e?.status).toBe('completed');
    expect(e?.watchedAt).toBe(todayDate());
  });

  it('ignores TV actions on a movie entry', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().setCurrentSeason(entry.id, 1);
    expect(useLibraryStore.getState().entries[entry.id]?.tv).toBeNull();
  });

  it('toggles an entry collection membership', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().toggleEntryCollection(entry.id, 'col-1');
    expect(useLibraryStore.getState().entries[entry.id]?.collectionIds).toEqual(['col-1']);
    await useLibraryStore.getState().toggleEntryCollection(entry.id, 'col-1');
    expect(useLibraryStore.getState().entries[entry.id]?.collectionIds).toEqual([]);
  });

  it('detaches a collection from all entries', async () => {
    const a = await useLibraryStore.getState().addTitle(addInput());
    const b = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().toggleEntryCollection(a.id, 'c');
    await useLibraryStore.getState().toggleEntryCollection(b.id, 'c');
    await useLibraryStore.getState().detachCollection('c');
    expect(useLibraryStore.getState().entries[a.id]?.collectionIds).toEqual([]);
    expect(useLibraryStore.getState().entries[b.id]?.collectionIds).toEqual([]);
  });

  it('toggles an entry tag membership', async () => {
    const entry = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().toggleEntryTag(entry.id, 'tag-1');
    expect(useLibraryStore.getState().entries[entry.id]?.tagIds).toEqual(['tag-1']);
    await useLibraryStore.getState().toggleEntryTag(entry.id, 'tag-1');
    expect(useLibraryStore.getState().entries[entry.id]?.tagIds).toEqual([]);
  });

  it('detaches a tag from all entries', async () => {
    const a = await useLibraryStore.getState().addTitle(addInput());
    const b = await useLibraryStore.getState().addTitle(addInput());
    await useLibraryStore.getState().toggleEntryTag(a.id, 't');
    await useLibraryStore.getState().toggleEntryTag(b.id, 't');
    await useLibraryStore.getState().detachTag('t');
    expect(useLibraryStore.getState().entries[a.id]?.tagIds).toEqual([]);
    expect(useLibraryStore.getState().entries[b.id]?.tagIds).toEqual([]);
  });
});
