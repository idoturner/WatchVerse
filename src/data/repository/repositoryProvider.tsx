import { useMemo, type ReactNode } from 'react';
import { getRepository } from './activeRepository';
import type { LibraryRepository } from './LibraryRepository';
import { RepositoryContext } from './repositoryContext';

/** Provides the active Repository to React components via context. */
export function RepositoryProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: LibraryRepository;
}) {
  const value = useMemo(() => repository ?? getRepository(), [repository]);
  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}
