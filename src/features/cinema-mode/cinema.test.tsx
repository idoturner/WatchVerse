import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { defaultSettings } from '@/domain/defaults';
import { createLibraryEntry } from '@/domain/library';
import type { LibraryEntry, MediaType, WatchStatus } from '@/domain/types';
import { renderWithProviders } from '@/test/utils';
import { useLibraryStore } from '@/stores/libraryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { CinemaModeScreen } from './CinemaModeScreen';
import { pickRandomEntry } from './pickRandom';

function entry(
  title: string,
  status: WatchStatus,
  release: { mediaType?: MediaType; year?: number | null; date?: string | null } = {},
): LibraryEntry {
  return {
    ...createLibraryEntry({
      tmdbId: Math.floor(Math.random() * 1e6),
      mediaType: release.mediaType ?? 'movie',
      snapshot: {
        title,
        posterPath: null,
        releaseYear: release.year ?? 2020, // default: a released (past) title
        releaseDate: release.date ?? null,
      },
    }),
    status,
  };
}

function setEntries(...list: LibraryEntry[]) {
  useLibraryStore.setState({
    entries: Object.fromEntries(list.map((e) => [e.id, e])),
    hydrated: true,
    error: null,
  });
}

function setReducedMotion(value: 'on' | 'off') {
  useSettingsStore.setState({
    settings: { ...defaultSettings(), reducedMotion: value },
    hydrated: true,
  });
}

describe('pickRandomEntry', () => {
  it('returns null for an empty pool', () => expect(pickRandomEntry([])).toBeNull());
  it('returns the only candidate', () => {
    const e = entry('A', 'want');
    expect(pickRandomEntry([e])).toBe(e);
  });
  it('excludes the previous pick when more than one exists', () => {
    const a = entry('A', 'want');
    const b = entry('B', 'want');
    expect(pickRandomEntry([a, b], a.id)).toBe(b);
  });
});

describe('CinemaModeScreen', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
    useSettingsStore.setState({ settings: defaultSettings(), hydrated: true });
  });

  it('guides the user when the library is empty', () => {
    setEntries(); // nothing saved at all
    renderWithProviders(<CinemaModeScreen />);
    expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument();
  });

  it('shows an accurate "move to Want to Watch" empty state when nothing is Want to Watch', () => {
    // A Completed movie exists, but Cinema Mode only picks Want to Watch.
    setEntries(entry('Already Seen', 'completed'));
    renderWithProviders(<CinemaModeScreen />);
    expect(screen.getByText(/No Want to Watch movies available for Cinema Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Move titles to Want to Watch/i)).toBeInTheDocument();
    expect(screen.queryByText('Your watchlist is empty')).not.toBeInTheDocument();
  });

  it('does not pick a title that is already Watching', async () => {
    const user = userEvent.setup();
    setReducedMotion('on');
    setEntries(
      entry('In Progress', 'watching'), // not eligible
      entry('Ready', 'want'), // eligible
    );
    renderWithProviders(<CinemaModeScreen />);
    await user.click(screen.getByRole('button', { name: /spin the reel/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ready');
    await user.click(screen.getByRole('button', { name: /spin again/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ready');
  });

  it('removes a title from the pool once it is marked as Watching', async () => {
    const user = userEvent.setup();
    setReducedMotion('on');
    setEntries(entry('Heat', 'want'), entry('Drive', 'want'));
    renderWithProviders(<CinemaModeScreen />);

    await user.click(screen.getByRole('button', { name: /spin the reel/i }));
    const first = screen.getByRole('heading', { level: 2 }).textContent;

    await user.click(screen.getByRole('button', { name: /mark as watching/i }));
    await waitFor(() =>
      expect(
        Object.values(useLibraryStore.getState().entries).some((e) => e.status === 'watching'),
      ).toBe(true),
    );

    // Spinning again can only land on the other (still Want to Watch) title.
    await user.click(screen.getByRole('button', { name: /spin again/i }));
    expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(first);
  });

  it('reveals the pick instantly under reduced motion (no rolling) and announces only the final', async () => {
    const user = userEvent.setup();
    setReducedMotion('on');
    setEntries(entry('Solo Pick', 'want'));
    renderWithProviders(<CinemaModeScreen />);

    await user.click(screen.getByRole('button', { name: /spin the reel/i }));

    expect(screen.getByRole('button', { name: /spin again/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /rolling/i })).not.toBeInTheDocument();
    // The final pick is announced via the live region.
    expect(screen.getByText('Selected: Solo Pick')).toBeInTheDocument();
  });

  it('never picks an unreleased title (excluded from the Cinema Mode pool)', async () => {
    const user = userEvent.setup();
    setReducedMotion('on');
    setEntries(
      entry('Out Now', 'want'), // released (2020)
      entry('Not Yet', 'want', { year: 2031, date: '2031-01-01' }), // future → excluded
    );
    renderWithProviders(<CinemaModeScreen />);

    await user.click(screen.getByRole('button', { name: /spin the reel/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Out Now');
    await user.click(screen.getByRole('button', { name: /spin again/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Out Now');
  });

  it('rolls only the selected media type', async () => {
    const user = userEvent.setup();
    setReducedMotion('on');
    setEntries(
      entry('A Movie', 'want'),
      entry('A Show', 'want', { mediaType: 'tv', year: 2019 }),
    );
    renderWithProviders(<CinemaModeScreen />);

    // Defaults to Movies.
    await user.click(screen.getByRole('button', { name: /spin the reel/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('A Movie');

    // Switch to TV Shows → only the show is eligible.
    await user.click(screen.getByRole('button', { name: 'TV Shows' }));
    await user.click(screen.getByRole('button', { name: /spin the reel/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('A Show');
  });

  it('shows a type-specific empty state when the selected type has only unreleased titles', () => {
    setEntries(entry('Way Future', 'want', { year: 2031, date: '2031-01-01' }));
    renderWithProviders(<CinemaModeScreen />);
    expect(screen.getByText(/released yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /spin the reel/i })).not.toBeInTheDocument();
  });

  it('offers working CTAs (View Details, Mark as Watching, Spin Again) and no "Start Watching"', async () => {
    const user = userEvent.setup();
    setReducedMotion('on');
    const e = entry('Heat', 'want');
    setEntries(e);
    renderWithProviders(<CinemaModeScreen />);

    await user.click(screen.getByRole('button', { name: /spin the reel/i }));
    expect(screen.getByRole('link', { name: /view details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /spin again/i })).toBeInTheDocument();
    expect(screen.queryByText(/start watching/i)).not.toBeInTheDocument();

    // "Mark as Watching" actually changes status and then removes itself.
    await user.click(screen.getByRole('button', { name: /mark as watching/i }));
    await waitFor(() => expect(useLibraryStore.getState().entries[e.id]?.status).toBe('watching'));
    expect(screen.queryByRole('button', { name: /mark as watching/i })).not.toBeInTheDocument();
  });

  describe('with the rolling animation', () => {
    afterEach(() => vi.useRealTimers());

    it('disables the control while rolling, ignores overlapping spins, then settles on a valid pick', () => {
      vi.useFakeTimers();
      setReducedMotion('off');
      const a = entry('Alpha', 'want');
      const b = entry('Beta', 'want');
      const c = entry('Gamma', 'want');
      useLibraryStore.setState({ entries: { [a.id]: a, [b.id]: b, [c.id]: c }, hydrated: true });
      renderWithProviders(<CinemaModeScreen />);

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /spin the reel/i }));
      });

      // Rolling: the control is disabled, so a second spin can't overlap.
      const rollingButton = screen.getByRole('button', { name: /rolling/i });
      expect(rollingButton).toBeDisabled();
      act(() => {
        fireEvent.click(rollingButton);
      });
      expect(screen.getByRole('button', { name: /rolling/i })).toBeInTheDocument();

      // Finish the roll → settles on one of the eligible candidates.
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(screen.getByRole('button', { name: /spin again/i })).toBeInTheDocument();
      const settledTitle = screen.getByRole('heading', { level: 2 }).textContent;
      expect(['Alpha', 'Beta', 'Gamma']).toContain(settledTitle);
    });
  });
});
