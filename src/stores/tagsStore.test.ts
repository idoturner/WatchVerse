import { beforeEach, describe, expect, it } from 'vitest';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { useLibraryStore } from './libraryStore';
import { useTagsStore } from './tagsStore';

const ts = () => useTagsStore.getState();

describe('tagsStore', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useTagsStore.setState({ items: {}, hydrated: true, error: null });
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  });

  it('creates and persists a tag', async () => {
    await ts().create('Rewatch');
    expect(Object.values(ts().items)).toHaveLength(1);
    useTagsStore.setState({ items: {}, hydrated: false });
    await ts().hydrate();
    expect(Object.values(ts().items)[0]?.name).toBe('Rewatch');
  });

  it('ignores empty names', async () => {
    expect(await ts().create('   ')).toBeNull();
    expect(Object.values(ts().items)).toHaveLength(0);
  });

  it('renames a tag (and ignores a no-op rename)', async () => {
    const tag = await ts().create('A');
    await ts().rename(tag!.id, 'B');
    expect(ts().items[tag!.id]?.name).toBe('B');
  });

  it('deletes a tag and detaches it from entries', async () => {
    const tag = await ts().create('Fave');
    const entry = await useLibraryStore.getState().addTitle({
      tmdbId: 1,
      mediaType: 'movie',
      snapshot: { title: 'X', posterPath: null, releaseYear: 2020 },
    });
    await useLibraryStore.getState().toggleEntryTag(entry.id, tag!.id);
    expect(useLibraryStore.getState().entries[entry.id]?.tagIds).toEqual([tag!.id]);

    await ts().remove(tag!.id);
    expect(ts().items[tag!.id]).toBeUndefined();
    expect(useLibraryStore.getState().entries[entry.id]?.tagIds).toEqual([]);
  });
});
