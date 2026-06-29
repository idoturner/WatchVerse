import { nanoid } from 'nanoid';
import type { Tag } from './types';

/** Pure factory: build a fresh Tag with a stable id and timestamps. */
export function createTag(name: string): Tag {
  const now = new Date().toISOString();
  return { id: nanoid(), name: name.trim(), createdAt: now, updatedAt: now };
}
