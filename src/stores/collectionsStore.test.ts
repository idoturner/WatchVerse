import { beforeEach, describe, expect, it } from 'vitest';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { useCollectionsStore } from './collectionsStore';
import { useLibraryStore } from './libraryStore';

const cs = () => useCollectionsStore.getState();

describe('collectionsStore', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useCollectionsStore.setState({ items: {}, hydrated: true, error: null });
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  });

  it('creates and persists a collection', async () => {
    const created = await cs().create('Marvel');
    expect(created).not.toBeNull();
    expect(Object.values(cs().items)).toHaveLength(1);

    useCollectionsStore.setState({ items: {}, hydrated: false });
    await cs().hydrate();
    expect(Object.values(cs().items)[0]?.name).toBe('Marvel');
  });

  it('ignores empty names', async () => {
    expect(await cs().create('   ')).toBeNull();
    expect(Object.values(cs().items)).toHaveLength(0);
  });

  it('renames a collection', async () => {
    const created = await cs().create('A');
    await cs().rename(created!.id, 'B');
    expect(cs().items[created!.id]?.name).toBe('B');
  });

  it('deletes a collection and detaches it from entries', async () => {
    const created = await cs().create('Faves');
    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 1,
      mediaType: 'movie',
      snapshot: { title: 'X', posterPath: null, releaseYear: 2020 },
    });
    await useLibraryStore.getState().toggleEntryCollection(entry.id, created!.id);
    expect(useLibraryStore.getState().entries[entry.id]?.collectionIds).toEqual([created!.id]);

    await cs().remove(created!.id);
    expect(cs().items[created!.id]).toBeUndefined();
    expect(useLibraryStore.getState().entries[entry.id]?.collectionIds).toEqual([]);
  });
});
