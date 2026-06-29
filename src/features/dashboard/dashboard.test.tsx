import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { defaultProfile } from '@/domain/defaults';
import { createLibraryEntry } from '@/domain/library';
import { renderWithProviders } from '@/test/utils';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { useActivityStore } from '@/stores/activityStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { useProfileStore } from '@/stores/profileStore';
import { useTagsStore } from '@/stores/tagsStore';
import { DashboardScreen } from './DashboardScreen';

function reset() {
  setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
  useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  useTagsStore.setState({ items: {}, hydrated: true, error: null });
  useProfileStore.setState({ profile: defaultProfile(), hydrated: true });
  useAchievementsStore.setState({ unlocked: {}, hydrated: true });
  useActivityStore.setState({ items: [], hydrated: true });
}

function completedMovie(title: string, rating: number | null) {
  return {
    ...createLibraryEntry({
      tmdbId: Math.floor(Math.random() * 1e6),
      mediaType: 'movie' as const,
      snapshot: { title, posterPath: null, releaseYear: 2021 },
    }),
    status: 'completed' as const,
    rating,
  };
}

describe('DashboardScreen', () => {
  beforeEach(reset);

  it('shows an empty state when the library is empty', () => {
    renderWithProviders(<DashboardScreen />);
    expect(screen.getByText('Your dashboard is waiting')).toBeInTheDocument();
  });

  it('renders stats, top movies, and the profile name', () => {
    const movie = completedMovie('Dune', 9);
    useLibraryStore.setState({ entries: { [movie.id]: movie }, hydrated: true });
    renderWithProviders(<DashboardScreen />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Movies watched')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Top movies' })).toBeInTheDocument();
    expect(screen.getAllByText('Dune').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /edit your name/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Achievements' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent activity' })).toBeInTheDocument();
  });

  it('edits the profile name', async () => {
    const user = userEvent.setup();
    const movie = completedMovie('X', null);
    useLibraryStore.setState({ entries: { [movie.id]: movie }, hydrated: true });
    renderWithProviders(<DashboardScreen />);

    await user.click(screen.getByRole('button', { name: /edit your name/i }));
    const input = screen.getByRole('textbox', { name: /your name/i });
    await user.clear(input);
    await user.type(input, 'Alex');
    await user.tab();
    expect(useProfileStore.getState().profile.displayName).toBe('Alex');
  });
});
