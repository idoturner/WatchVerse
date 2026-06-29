import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { createLibraryEntry } from '@/domain/library';
import { createTag } from '@/domain/tags';
import { renderWithProviders } from '@/test/utils';
import { useLibraryStore, useTrackedEntry } from '@/stores/libraryStore';
import { useTagsStore } from '@/stores/tagsStore';
import { TagManagerDialog } from './components/TagManagerDialog';
import { TagPicker } from './components/TagPicker';

function reset() {
  setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
  useTagsStore.setState({ items: {}, hydrated: true, error: null });
  useLibraryStore.setState({ entries: {}, hydrated: true, error: null });
}

function PickerHarness() {
  const entry = useTrackedEntry('movie', 1);
  return entry ? <TagPicker entry={entry} /> : null;
}

function seedEntry() {
  const entry = createLibraryEntry({
    tmdbId: 1,
    mediaType: 'movie',
    snapshot: { title: 'X', posterPath: null, releaseYear: 2020 },
  });
  useLibraryStore.setState({ entries: { [entry.id]: entry }, hydrated: true });
  return entry;
}

describe('TagPicker', () => {
  beforeEach(reset);

  it('toggles an existing tag', async () => {
    const user = userEvent.setup();
    const tag = createTag('Fave');
    useTagsStore.setState({ items: { [tag.id]: tag }, hydrated: true });
    const entry = seedEntry();

    renderWithProviders(<PickerHarness />);
    await user.click(screen.getByRole('checkbox', { name: 'Fave' }));
    expect(useLibraryStore.getState().entries[entry.id]?.tagIds).toContain(tag.id);
  });

  it('creates a tag inline and applies it', async () => {
    const user = userEvent.setup();
    const entry = seedEntry();
    renderWithProviders(<PickerHarness />);

    await user.type(screen.getByRole('textbox', { name: /new tag name/i }), 'Rewatch');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    const created = Object.values(useTagsStore.getState().items).find((t) => t.name === 'Rewatch');
    expect(created).toBeDefined();
    expect(useLibraryStore.getState().entries[entry.id]?.tagIds).toContain(created!.id);
  });
});

describe('TagManagerDialog', () => {
  beforeEach(reset);

  it('creates and deletes a tag', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TagManagerDialog />);
    await user.click(screen.getByRole('button', { name: /manage tags/i }));
    await user.type(screen.getByRole('textbox', { name: /new tag name/i }), 'Classic');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(Object.values(useTagsStore.getState().items).map((t) => t.name)).toContain('Classic');

    await user.click(screen.getByRole('button', { name: /delete tag classic/i }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    expect(Object.values(useTagsStore.getState().items)).toHaveLength(0);
  });

  it('renames a tag on blur', async () => {
    const user = userEvent.setup();
    const tag = createTag('Old');
    useTagsStore.setState({ items: { [tag.id]: tag }, hydrated: true });
    renderWithProviders(<TagManagerDialog />);

    await user.click(screen.getByRole('button', { name: /manage tags/i }));
    const input = screen.getByRole('textbox', { name: /rename tag old/i });
    await user.clear(input);
    await user.type(input, 'New');
    await user.tab();

    expect(useTagsStore.getState().items[tag.id]?.name).toBe('New');
  });
});
