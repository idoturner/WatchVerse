import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';
import { TitleDetailScreen } from './TitleDetailScreen';

function renderDetail(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="title/:mediaType/:id" element={<TitleDetailScreen />} />
    </Routes>,
    { route },
  );
}

describe('TitleDetailScreen (integration)', () => {
  it('renders full detail (happy path)', async () => {
    renderDetail('/title/movie/1');
    expect(await screen.findByRole('heading', { name: 'Dune', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/desert planet/)).toBeInTheDocument();
    expect(screen.getByText('Timothée Chalamet')).toBeInTheDocument();
    expect(screen.getByText(/Denis Villeneuve/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /play trailer/i })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abc123',
    );
    expect(screen.getByText('Arrival')).toBeInTheDocument();
  });

  it('handles incomplete data gracefully (no backdrop/trailer/cast)', async () => {
    renderDetail('/title/movie/2');
    expect(
      await screen.findByRole('heading', { name: 'Minimal Movie', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('No overview available.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /play trailer/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cast' })).not.toBeInTheDocument();
  });

  it('shows a not-found state for a missing title (404)', async () => {
    renderDetail('/title/movie/999');
    expect(await screen.findByText('Title not found')).toBeInTheDocument();
  });

  it('shows an error state with retry when the request fails (500)', async () => {
    renderDetail('/title/movie/500');
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows a not-found state for an invalid route param', async () => {
    renderDetail('/title/person/abc');
    expect(await screen.findByText('Title not found')).toBeInTheDocument();
  });
});
