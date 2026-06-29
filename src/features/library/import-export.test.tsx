import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { defaultProfile, defaultSettings } from '@/domain/defaults';
import { createLibraryEntry } from '@/domain/library';
import type { WatchVerseExport } from '@/domain/types';
import { renderWithProviders } from '@/test/utils';
import { useLibraryStore } from '@/stores/libraryStore';
import { ImportExportControls } from './components/ImportExportControls';

function validBackupFile(): File {
  const data: WatchVerseExport = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '0.0.0',
    data: {
      entries: [
        createLibraryEntry({
          tmdbId: 1,
          mediaType: 'movie',
          snapshot: { title: 'Imported', posterPath: null, releaseYear: 2020 },
        }),
      ],
      collections: [],
      tags: [],
      profile: defaultProfile(),
      settings: defaultSettings(),
      activity: [],
      achievements: [],
      searchHistory: [],
    },
  };
  return new File([JSON.stringify(data)], 'backup.json', { type: 'application/json' });
}

describe('ImportExportControls', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
  });

  it('merges a valid imported backup into the library', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<ImportExportControls />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [validBackupFile()] } });

    await user.click(await screen.findByRole('button', { name: /merge \(recommended\)/i }));
    await waitFor(() => expect(Object.values(useLibraryStore.getState().entries)).toHaveLength(1));
  });

  it('rejects an invalid backup without opening the import dialog', async () => {
    const errorSpy = vi.spyOn(toast, 'error').mockImplementation(() => 'id');
    const { container } = renderWithProviders(<ImportExportControls />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(['not json'], 'bad.json', { type: 'application/json' })] },
    });

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(screen.queryByText('Import library')).not.toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
