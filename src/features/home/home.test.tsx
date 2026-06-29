import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { createLibraryEntry } from '@/domain/library';
import { renderWithProviders } from '@/test/utils';
import { useLibraryStore } from '@/stores/libraryStore';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  });

  it('renders TMDB rails', async () => {
    renderWithProviders(<HomeScreen />);
    expect(await screen.findByText('Popular Movie')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trending this week' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Popular anime' })).toBeInTheDocument();
  });

  it('hides the Recently added rail at cold start (empty library)', async () => {
    renderWithProviders(<HomeScreen />);
    await screen.findByText('Popular Movie');
    expect(screen.queryByText('Recently added')).not.toBeInTheDocument();
  });

  it('shows recently added titles from the local library', () => {
    const entry = createLibraryEntry({
      tmdbId: 1,
      mediaType: 'movie',
      snapshot: { title: 'My Tracked', posterPath: null, releaseYear: 2020 },
    });
    useLibraryStore.setState({ entries: { [entry.id]: entry }, hydrated: true, error: null });
    renderWithProviders(<HomeScreen />);
    expect(screen.getByRole('heading', { name: 'Recently added' })).toBeInTheDocument();
    expect(screen.getByText('My Tracked')).toBeInTheDocument();
  });

  it('shows personalized recommendations when there is a strong signal', async () => {
    const entry = {
      ...createLibraryEntry({
        tmdbId: 1,
        mediaType: 'movie' as const,
        snapshot: { title: 'Loved', posterPath: null, releaseYear: 2020 },
      }),
      status: 'completed' as const,
    };
    useLibraryStore.setState({ entries: { [entry.id]: entry }, hydrated: true, error: null });
    renderWithProviders(<HomeScreen />);
    expect(await screen.findByRole('heading', { name: 'Recommended for you' })).toBeInTheDocument();
    expect(await screen.findByText('Recommended Movie')).toBeInTheDocument();
  });

  it('falls back to popular picks for an empty library', async () => {
    renderWithProviders(<HomeScreen />);
    expect(
      await screen.findByRole('heading', { name: 'Popular picks to get started' }),
    ).toBeInTheDocument();
  });

  describe('offline', () => {
    let original: PropertyDescriptor | undefined;
    beforeEach(() => {
      original = Object.getOwnPropertyDescriptor(window.navigator, 'onLine');
      Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
    });
    afterEach(() => {
      if (original) Object.defineProperty(window.navigator, 'onLine', original);
    });

    it('shows an offline notice instead of TMDB rails', () => {
      renderWithProviders(<HomeScreen />);
      expect(screen.getByText("You're offline")).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Trending this week' })).not.toBeInTheDocument();
    });
  });
});
