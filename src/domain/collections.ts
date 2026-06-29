import { nanoid } from 'nanoid';
import type { Collection } from './types';

/** Pure factory: build a fresh Collection with a stable id and timestamps. */
export function createCollection(name: string): Collection {
  const now = new Date().toISOString();
  return { id: nanoid(), name: name.trim(), createdAt: now, updatedAt: now };
}
