import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { RouteError } from './RouteError';

function renderWithError(thrown: unknown) {
  function Boom(): never {
    throw thrown;
  }
  const router = createMemoryRouter(
    [{ path: '/', element: <Boom />, errorElement: <RouteError /> }],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('RouteError', () => {
  it('shows a calm fallback with a way home for unexpected errors', () => {
    renderWithError(new Error('kaboom'));
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/your tracked library is safe/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  it('shows a 404 when rendered as the catch-all route (no error in context)', () => {
    const router = createMemoryRouter([{ path: '*', element: <RouteError /> }], {
      initialEntries: ['/does-not-exist'],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toBeInTheDocument();
  });
});
