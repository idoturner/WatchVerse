import type { LibraryEntry } from '@/domain/types';

/** Pick a random entry, avoiding an immediate repeat when more than one exists. Pure. */
export function pickRandomEntry(
  candidates: LibraryEntry[],
  excludeId?: string,
): LibraryEntry | null {
  const pool =
    excludeId && candidates.length > 1 ? candidates.filter((e) => e.id !== excludeId) : candidates;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
