import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { createCollection } from '@/domain/collections';
import { createLibraryEntry } from '@/domain/library';
import { renderWithProviders } from '@/test/utils';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore, useTrackedEntry } from '@/stores/libraryStore';
import { CollectionPicker } from './components/CollectionPicker';

function Harness() {
  const entry = useTrackedEntry('movie', 1);
  return entry ? <CollectionPicker entry={entry} /> : null;
}

function seedEntry() {
  const entry = createLibraryEntry({
    tmdbId: 1,
    mediaType: 'movie',
    snapshot: { title: 'X', posterPath: null, releaseYear: 2020 },
  });
  useLibraryStore.setState({ entries: { [entry.id]: entry }, hydrated: true, error: null });
  return entry;
}

describe('CollectionPicker', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useCollectionsStore.setState({ items: {}, hydrated: true, error: null });
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  });

  it('toggles membership of an existing collection', async () => {
    const user = userEvent.setup();
    const collection = createCollection('Marvel');
    useCollectionsStore.setState({ items: { [collection.id]: collection }, hydrated: true });
    const entry = seedEntry();

    renderWithProviders(<Harness />);
    const checkbox = screen.getByRole('checkbox', { name: 'Marvel' });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(useLibraryStore.getState().entries[entry.id]?.collectionIds).toContain(collection.id);
  });

  it('creates a collection inline and adds the title to it', async () => {
    const user = userEvent.setup();
    const entry = seedEntry();
    renderWithProviders(<Harness />);

    await user.type(screen.getByRole('textbox', { name: /new collection name/i }), 'Date Night');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    const created = Object.values(useCollectionsStore.getState().items).find(
      (c) => c.name === 'Date Night',
    );
    expect(created).toBeDefined();
    expect(useLibraryStore.getState().entries[entry.id]?.collectionIds).toContain(created!.id);
  });
});
