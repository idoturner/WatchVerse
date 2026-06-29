import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { createCollection } from '@/domain/collections';
import { createLibraryEntry } from '@/domain/library';
import { renderWithProviders } from '@/test/utils';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { CollectionDetailScreen } from './CollectionDetailScreen';
import { CollectionsScreen } from './CollectionsScreen';

function reset() {
  setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
  useCollectionsStore.setState({ items: {}, hydrated: true, error: null });
  useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
}

describe('CollectionsScreen', () => {
  beforeEach(reset);

  it('shows an empty state and creates a collection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CollectionsScreen />);
    expect(screen.getByText('No collections yet')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /new collection/i }));
    await user.type(screen.getByRole('textbox', { name: /collection name/i }), 'Marvel');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Marvel')).toBeInTheDocument();
  });
});

describe('CollectionDetailScreen', () => {
  beforeEach(reset);

  function renderDetail(id: string) {
    return renderWithProviders(
      <Routes>
        <Route path="collections/:id" element={<CollectionDetailScreen />} />
      </Routes>,
      { route: `/collections/${id}` },
    );
  }

  it('lists titles in the collection', () => {
    const collection = createCollection('Marvel');
    useCollectionsStore.setState({ items: { [collection.id]: collection }, hydrated: true });
    const entry = {
      ...createLibraryEntry({
        tmdbId: 1,
        mediaType: 'movie' as const,
        snapshot: { title: 'Iron Man', posterPath: null, releaseYear: 2008 },
      }),
      collectionIds: [collection.id],
    };
    useLibraryStore.setState({ entries: { [entry.id]: entry }, hydrated: true });

    renderDetail(collection.id);
    expect(screen.getByRole('heading', { name: 'Marvel' })).toBeInTheDocument();
    expect(screen.getByText('Iron Man')).toBeInTheDocument();
  });

  it('renames the collection', async () => {
    const user = userEvent.setup();
    const collection = createCollection('Old');
    useCollectionsStore.setState({ items: { [collection.id]: collection }, hydrated: true });
    renderDetail(collection.id);

    await user.click(screen.getByRole('button', { name: /rename/i }));
    const input = screen.getByRole('textbox', { name: /collection name/i });
    await user.clear(input);
    await user.type(input, 'New Name');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByRole('heading', { name: 'New Name' })).toBeInTheDocument();
  });

  it('deletes the collection after confirmation', async () => {
    const user = userEvent.setup();
    const collection = createCollection('Doomed');
    useCollectionsStore.setState({ items: { [collection.id]: collection }, hydrated: true });
    renderDetail(collection.id);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(useCollectionsStore.getState().items[collection.id]).toBeUndefined();
  });

  it('shows a not-found state for a missing collection', () => {
    renderDetail('missing');
    expect(screen.getByText('Collection not found')).toBeInTheDocument();
  });
});
