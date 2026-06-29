import type { LibraryRepository } from './LibraryRepository';
import { createLocalStorageLibraryRepository } from './localStorage/LocalStorageLibraryRepository';

/**
 * The active Repository instance used by non-React code (Zustand stores). Lazily
 * created as the LocalStorage implementation; `setRepository` allows tests to inject
 * an in-memory implementation and lets a future backend swap in (ADR-001).
 */
let active: LibraryRepository | null = null;

export function getRepository(): LibraryRepository {
  if (!active) {
    active = createLocalStorageLibraryRepository();
  }
  return active;
}

export function setRepository(repository: LibraryRepository): void {
  active = repository;
}
