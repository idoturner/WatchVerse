import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { RepositoryProvider } from '@/data/repository/repositoryProvider';

/**
 * Render with a fresh QueryClient (no retries), a MemoryRouter, and the active
 * Repository (so useRepository works; tests inject an in-memory one via setRepository).
 */
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0, gcTime: 0 } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RepositoryProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </RepositoryProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
