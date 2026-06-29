import { nanoid } from 'nanoid';
import type { LibraryEntry, MediaType, TitleSnapshot, WatchStatus } from './types';

export interface CreateLibraryEntryInput {
  tmdbId: number;
  mediaType: MediaType;
  snapshot: TitleSnapshot;
  status?: WatchStatus;
}

/** Pure factory: build a fresh LibraryEntry with stable id and timestamps. */
export function createLibraryEntry(input: CreateLibraryEntryInput): LibraryEntry {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    tmdbId: input.tmdbId,
    mediaType: input.mediaType,
    snapshot: input.snapshot,
    status: input.status ?? 'want',
    rating: null,
    review: null,
    watchedAt: null,
    rewatchCount: 0,
    tv:
      input.mediaType === 'tv'
        ? { currentSeason: null, completedSeasons: [], isShowCompleted: false }
        : null,
    collectionIds: [],
    tagIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Pure: return a copy of the entry with a refreshed updatedAt timestamp. */
export function touchEntry(entry: LibraryEntry): LibraryEntry {
  return { ...entry, updatedAt: new Date().toISOString() };
}

/** Build the small denormalized snapshot stored on a LibraryEntry from a title. */
export function snapshotFromTitle(title: {
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  releaseDate?: string | null;
}): TitleSnapshot {
  return {
    title: title.title,
    posterPath: title.posterPath,
    releaseYear: title.releaseYear,
    releaseDate: title.releaseDate ?? null,
  };
}

/** Today's date as a YYYY-MM-DD string (date-only, used for watch dates). */
export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Normalize a review: trim, return null when empty, cap at 500 characters. */
export function normalizeReview(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, 500);
}

/** Coerce a rewatch count to a non-negative integer. */
export function clampRewatchCount(value: number): number {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
}

/** A valid watch date is a real YYYY-MM-DD date that is not in the future. */
export function isValidWatchDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  return value <= todayDate();
}
