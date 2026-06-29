import { beforeEach, describe, expect, it } from 'vitest';
import { ACTIVITY_CAP } from '@/config/constants';
import { getRepository, setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { useActivityStore } from './activityStore';
import { useLibraryStore } from './libraryStore';

const act = () => useActivityStore.getState();

describe('activityStore', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useActivityStore.setState({ items: [], hydrated: true });
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  });

  it('logs and persists a human-readable event', async () => {
    await act().log({ type: 'added', label: 'Added Dune', refId: 'e1' });
    expect(act().items[0]?.label).toBe('Added Dune');

    const persisted = await getRepository().getActivity();
    expect(persisted[0]?.label).toBe('Added Dune');
  });

  it('collapses consecutive repeats of the same event on the same target', async () => {
    await act().log({ type: 'rated', label: 'Rated X 6/10', refId: 'e1' });
    await act().log({ type: 'rated', label: 'Rated X 7/10', refId: 'e1' });
    await act().log({ type: 'rated', label: 'Rated X 8/10', refId: 'e1' });
    expect(act().items).toHaveLength(1);
    expect(act().items[0]?.label).toBe('Rated X 8/10');
  });

  it('keeps distinct events separate', async () => {
    await act().log({ type: 'rated', label: 'Rated X 6/10', refId: 'e1' });
    await act().log({ type: 'rated', label: 'Rated Y 6/10', refId: 'e2' });
    expect(act().items).toHaveLength(2);
  });

  it('caps the timeline length', async () => {
    for (let i = 0; i < ACTIVITY_CAP + 5; i++) {
      await act().log({ type: 'added', label: `Added ${i}`, refId: `e${i}` });
    }
    expect(act().items).toHaveLength(ACTIVITY_CAP);
  });

  it('records an activity entry when a title is added via the library store', async () => {
    await useLibraryStore.getState().addTitle({
      tmdbId: 42,
      mediaType: 'movie',
      snapshot: { title: 'Heat', posterPath: null, releaseYear: 1995 },
    });
    expect(act().items.some((a) => a.type === 'added' && a.label === 'Added Heat')).toBe(true);
  });

  it('does not log activity when a mutation fails to persist (and rolls back)', async () => {
    const repo = createLocalStorageLibraryRepository(createMemoryStore());
    setRepository(repo);
    useActivityStore.setState({ items: [], hydrated: true });
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });

    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 1,
      mediaType: 'movie',
      snapshot: { title: 'X', posterPath: null, releaseYear: 2020 },
    });
    // Drop the legitimate "added" entry, then force persistence to fail.
    useActivityStore.setState({ items: [] });
    repo.upsertEntry = () => Promise.reject(new Error('disk full'));

    await expect(useLibraryStore.getState().setStatus(entry.id, 'completed')).rejects.toThrow();

    expect(act().items).toHaveLength(0); // no false activity for the failed change
    expect(useLibraryStore.getState().entries[entry.id]?.status).not.toBe('completed'); // rolled back
  });

  it('logs exactly one completion-oriented entry when a movie is completed', async () => {
    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 7,
      mediaType: 'movie',
      snapshot: { title: 'Z', posterPath: null, releaseYear: 2020 },
    });
    useActivityStore.setState({ items: [] }); // ignore the "added" entry
    await useLibraryStore.getState().setStatus(entry.id, 'completed');

    const completion = act().items.filter((a) => /completed/i.test(a.label));
    expect(completion).toHaveLength(1);
    expect(completion[0]?.label).toBe('Completed Z');
  });

  it('logs a single completion entry for a TV show completion', async () => {
    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 8,
      mediaType: 'tv',
      snapshot: { title: 'S', posterPath: null, releaseYear: 2020 },
    });
    useActivityStore.setState({ items: [] });
    await useLibraryStore.getState().setShowCompleted(entry.id, true);

    expect(act().items).toHaveLength(1);
    expect(act().items[0]?.type).toBe('completed_show');
    expect(act().items[0]?.label).toBe('Completed S');
  });
});
