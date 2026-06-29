import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { createLibraryEntry } from '@/domain/library';
import type { LibraryEntry, TitleSeason } from '@/domain/types';
import { renderWithProviders } from '@/test/utils';
import { useLibraryStore, useTrackedEntry } from '@/stores/libraryStore';
import { TvSeasonsPanel } from './components/TvSeasonsPanel';

const SEASONS: TitleSeason[] = [
  {
    seasonNumber: 1,
    name: 'Season 1',
    episodeCount: 9,
    airDate: '2020-01-01',
    posterPath: null,
    overview: 'S1 secrets',
  },
  {
    seasonNumber: 2,
    name: 'Season 2',
    episodeCount: 10,
    airDate: '2021-01-01',
    posterPath: null,
    overview: 'S2 secrets',
  },
];

function Harness({ spoiler = false }: { spoiler?: boolean }) {
  const entry = useTrackedEntry('tv', 1);
  return <TvSeasonsPanel seasons={SEASONS} entry={entry} spoilerProtection={spoiler} />;
}

function seedShow(): LibraryEntry {
  const entry = createLibraryEntry({
    tmdbId: 1,
    mediaType: 'tv',
    snapshot: { title: 'Show', posterPath: null, releaseYear: 2020 },
  });
  useLibraryStore.setState({ entries: { [entry.id]: entry }, hydrated: true, error: null });
  return entry;
}

describe('TvSeasonsPanel', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  });

  it('lists seasons', () => {
    seedShow();
    renderWithProviders(<Harness />);
    expect(screen.getByText('Season 1')).toBeInTheDocument();
    expect(screen.getByText('Season 2')).toBeInTheDocument();
  });

  it('sets a current season', async () => {
    const user = userEvent.setup();
    const entry = seedShow();
    renderWithProviders(<Harness />);
    const buttons = screen.getAllByRole('button', { name: /set current/i });
    await user.click(buttons[1]!); // Season 2
    expect(useLibraryStore.getState().entries[entry.id]?.tv?.currentSeason).toBe(2);
    expect(await screen.findByText('Current')).toBeInTheDocument();
  });

  it('toggles a season as complete', async () => {
    const user = userEvent.setup();
    const entry = seedShow();
    renderWithProviders(<Harness />);
    await user.click(screen.getByRole('checkbox', { name: /mark season 1 complete/i }));
    expect(useLibraryStore.getState().entries[entry.id]?.tv?.completedSeasons).toEqual([1]);
  });

  it('marks the whole show completed', async () => {
    const user = userEvent.setup();
    const entry = seedShow();
    renderWithProviders(<Harness />);
    await user.click(screen.getByRole('checkbox', { name: /show completed/i }));
    const e = useLibraryStore.getState().entries[entry.id];
    expect(e?.tv?.isShowCompleted).toBe(true);
    expect(e?.status).toBe('completed');
  });

  it('keeps spoiler overviews out of the DOM (hidden from assistive tech) until revealed', async () => {
    const user = userEvent.setup();
    seedShow();
    renderWithProviders(<Harness spoiler />);

    // Spoiler text is not rendered at all — so screen readers cannot reach it.
    expect(screen.queryByText('S1 secrets')).not.toBeInTheDocument();
    expect(screen.queryByText('S2 secrets')).not.toBeInTheDocument();
    expect(screen.getAllByText('Overview hidden to avoid spoilers')).toHaveLength(2);

    const reveals = screen.getAllByRole('button', { name: /reveal/i });
    expect(reveals).toHaveLength(2);
    await user.click(reveals[0]!);

    // After an intentional reveal, the overview becomes real, readable DOM content.
    expect(screen.getByText('S1 secrets')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /reveal/i })).toHaveLength(1);
  });

  it('shows overviews normally when spoiler protection is off', () => {
    seedShow();
    renderWithProviders(<Harness spoiler={false} />);
    expect(screen.getByText('S1 secrets')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reveal/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Overview hidden/)).not.toBeInTheDocument();
  });
});
