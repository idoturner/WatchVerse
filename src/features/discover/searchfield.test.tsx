import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { renderWithProviders } from '@/test/utils';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';
import { SearchField } from './components/SearchField';

describe('SearchField (combobox)', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useSearchHistoryStore.setState({ items: [], hydrated: true });
  });

  it('shows recent searches on focus and removes one', async () => {
    const user = userEvent.setup();
    useSearchHistoryStore.setState({
      items: [
        { query: 'dune', createdAt: 'x' },
        { query: 'heat', createdAt: 'y' },
      ],
      hydrated: true,
    });
    renderWithProviders(<SearchField />);

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('dune')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove dune from recent searches/i }));
    expect(useSearchHistoryStore.getState().items.map((i) => i.query)).toEqual(['heat']);
  });

  it('adds the query to history when submitting with Enter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchField />);
    await user.type(screen.getByRole('combobox'), 'dune{Enter}');
    expect(useSearchHistoryStore.getState().items[0]?.query).toBe('dune');
  });

  it('shows title suggestions while typing and supports arrow navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchField />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'du');
    expect(await screen.findByText('Dune Suggestion')).toBeInTheDocument();
    // Search stays permissive: a poster-less result (filtered out of rails) still appears here.
    expect(screen.getByText('Severance Suggestion')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-activedescendant', 'query');
  });

  it('closes the dropdown on Escape', async () => {
    const user = userEvent.setup();
    useSearchHistoryStore.setState({ items: [{ query: 'dune', createdAt: 'x' }], hydrated: true });
    renderWithProviders(<SearchField />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
