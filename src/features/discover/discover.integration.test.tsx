import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { DiscoverScreen } from './DiscoverScreen';

describe('DiscoverScreen (integration)', () => {
  it('shows search results for a query (happy path)', async () => {
    renderWithProviders(<DiscoverScreen />, { route: '/?q=dune' });
    expect(await screen.findByText('Dune: Part Two')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Results for/ })).toBeInTheDocument();
  });

  it('shows an empty state when there are no results', async () => {
    renderWithProviders(<DiscoverScreen />, { route: '/?q=nothing' });
    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });

  it('shows an error state with a retry action when the request fails', async () => {
    renderWithProviders(<DiscoverScreen />, { route: '/?q=boom' });
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('browses discover results when there is no query', async () => {
    renderWithProviders(<DiscoverScreen />, { route: '/' });
    expect(await screen.findByText('Popular Pick')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Discover' })).toBeInTheDocument();
  });
});
