import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { RepositoryProvider } from '@/data/repository/repositoryProvider';

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // catalog data changes slowly
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** Composes the app-wide providers: server-state, repository, and toasts. */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <RepositoryProvider>{children}</RepositoryProvider>
      <Toaster theme="dark" position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
