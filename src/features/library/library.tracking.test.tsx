import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { defaultSettings } from '@/domain/defaults';
import type { TmdbTitle } from '@/domain/types';
import { renderWithProviders } from '@/test/utils';
import { useLibraryStore } from '@/stores/libraryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { TrackableTitleCard } from './components/TrackableTitleCard';

const sample: TmdbTitle = {
  tmdbId: 1,
  mediaType: 'movie',
  title: 'Dune',
  overview: '',
  posterPath: null,
  backdropPath: null,
  releaseYear: 2021,
  releaseDate: '2021-10-22',
  voteAverage: 8,
  genreIds: [],
};

async function seedTracked() {
  await useLibraryStore.getState().addTitle({
    tmdbId: 1,
    mediaType: 'movie',
    snapshot: { title: 'Dune', posterPath: null, releaseYear: 2021 },
    status: 'want',
  });
}

describe('Tracking via TrackableTitleCard', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
    useSettingsStore.setState({ settings: defaultSettings(), hydrated: true });
  });

  it('adds a title with a chosen status and reflects it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrackableTitleCard title={sample} />);

    await user.click(screen.getByRole('button', { name: /add dune to your library/i }));
    await user.click(await screen.findByRole('menuitem', { name: 'Watching' }));

    expect(Object.values(useLibraryStore.getState().entries)).toHaveLength(1);
    expect(await screen.findByText('Watching')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change status for dune/i })).toBeInTheDocument();
  });

  it('removes a tracked title after confirming (confirm-before-delete on)', async () => {
    const user = userEvent.setup();
    await seedTracked();
    renderWithProviders(<TrackableTitleCard title={sample} />);

    await user.click(screen.getByRole('button', { name: /change status for dune/i }));
    await user.click(await screen.findByRole('menuitem', { name: /remove from library/i }));

    // Confirmation dialog appears.
    await user.click(await screen.findByRole('button', { name: 'Remove' }));
    expect(Object.values(useLibraryStore.getState().entries)).toHaveLength(0);
  });

  it('removes immediately when confirm-before-delete is off', async () => {
    const user = userEvent.setup();
    useSettingsStore.setState({
      settings: { ...defaultSettings(), confirmBeforeDelete: false },
      hydrated: true,
    });
    await seedTracked();
    renderWithProviders(<TrackableTitleCard title={sample} />);

    await user.click(screen.getByRole('button', { name: /change status for dune/i }));
    await user.click(await screen.findByRole('menuitem', { name: /remove from library/i }));

    expect(Object.values(useLibraryStore.getState().entries)).toHaveLength(0);
  });
});
