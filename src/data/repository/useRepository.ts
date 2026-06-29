import { useContext } from 'react';
import { RepositoryContext } from './repositoryContext';
import type { LibraryRepository } from './LibraryRepository';

export function useRepository(): LibraryRepository {
  const ctx = useContext(RepositoryContext);
  if (!ctx) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return ctx;
}
