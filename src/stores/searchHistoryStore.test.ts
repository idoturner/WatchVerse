import { beforeEach, describe, expect, it } from 'vitest';
import { SEARCH_HISTORY_CAP } from '@/config/constants';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { useSearchHistoryStore } from './searchHistoryStore';

const s = () => useSearchHistoryStore.getState();

describe('searchHistoryStore', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useSearchHistoryStore.setState({ items: [], hydrated: true });
  });

  it('adds, dedupes case-insensitively (most recent first), and persists', async () => {
    await s().add('Dune');
    await s().add('Heat');
    await s().add('dune');
    expect(s().items.map((i) => i.query)).toEqual(['dune', 'Heat']);

    useSearchHistoryStore.setState({ items: [], hydrated: false });
    await s().hydrate();
    expect(s().items.map((i) => i.query)).toEqual(['dune', 'Heat']);
  });

  it('ignores empty queries', async () => {
    await s().add('   ');
    expect(s().items).toEqual([]);
  });

  it('caps the history length', async () => {
    for (let i = 0; i < SEARCH_HISTORY_CAP + 5; i += 1) {
      await s().add(`q${i}`);
    }
    expect(s().items).toHaveLength(SEARCH_HISTORY_CAP);
  });

  it('removes and clears', async () => {
    await s().add('a');
    await s().add('b');
    await s().remove('a');
    expect(s().items.map((i) => i.query)).toEqual(['b']);
    await s().clear();
    expect(s().items).toEqual([]);
  });
});
