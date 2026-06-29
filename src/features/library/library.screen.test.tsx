import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { createLibraryEntry } from '@/domain/library';
import { createTag } from '@/domain/tags';
import type { LibraryEntry, WatchStatus } from '@/domain/types';
import { renderWithProviders } from '@/test/utils';
import { useLibraryStore } from '@/stores/libraryStore';
import { useTagsStore } from '@/stores/tagsStore';
import { LibraryScreen } from './LibraryScreen';

function make(title: string, opts: { id: number; status?: WatchStatus }): LibraryEntry {
  return {
    ...createLibraryEntry({
      tmdbId: opts.id,
      mediaType: 'movie',
      snapshot: { title, posterPath: null, releaseYear: 2020 },
    }),
    status: opts.status ?? 'want',
  };
}

function seed(entries: LibraryEntry[]) {
  useLibraryStore.setState({
    entries: Object.fromEntries(entries.map((e) => [e.id, e])),
    hydrated: true,
    error: null,
  });
}

describe('LibraryScreen', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
    useTagsStore.setState({ items: {}, hydrated: true, error: null });
  });

  it('shows an empty state when there are no entries', () => {
    renderWithProviders(<LibraryScreen />);
    expect(screen.getByText('Your library is empty')).toBeInTheDocument();
  });

  it('lists tracked titles and links to their detail pages', () => {
    seed([make('Dune', { id: 1, status: 'completed' })]);
    renderWithProviders(<LibraryScreen />);
    expect(screen.getByRole('link', { name: 'Dune' })).toHaveAttribute('href', '/title/movie/1');
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    seed([
      make('Watching One', { id: 1, status: 'watching' }),
      make('Completed One', { id: 2, status: 'completed' }),
    ]);
    renderWithProviders(<LibraryScreen />);
    expect(screen.getByText('Watching One')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: /filter by status/i }),
      'completed',
    );
    expect(screen.queryByText('Watching One')).not.toBeInTheDocument();
    expect(screen.getByText('Completed One')).toBeInTheDocument();
  });

  it('sorts A–Z', async () => {
    const user = userEvent.setup();
    seed([make('Zebra', { id: 1 }), make('Apple', { id: 2 })]);
    renderWithProviders(<LibraryScreen />);
    await user.selectOptions(screen.getByRole('combobox', { name: /sort by/i }), 'az');
    const titles = screen.getAllByText(/^(Apple|Zebra)$/).map((n) => n.textContent);
    expect(titles[0]).toBe('Apple');
  });

  it('filters by tag', async () => {
    const user = userEvent.setup();
    const tag = createTag('Fave');
    useTagsStore.setState({ items: { [tag.id]: tag }, hydrated: true });
    seed([{ ...make('Tagged', { id: 1 }), tagIds: [tag.id] }, make('Untagged', { id: 2 })]);
    renderWithProviders(<LibraryScreen />);
    expect(screen.getByText('Untagged')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: /filter by tag/i }), tag.id);
    expect(screen.getByText('Tagged')).toBeInTheDocument();
    expect(screen.queryByText('Untagged')).not.toBeInTheDocument();
  });
});
