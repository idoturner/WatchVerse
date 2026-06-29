import type { LibraryEntry, MediaType, TitleSnapshot } from '@/domain/types';

/**
 * Cinema Mode helps the user choose something *new to start*, so only "Want to Watch" is
 * eligible. "Watching" is a deliberate, in-progress choice (and, for TV, a progress-tracking
 * flow) — not a random "what should I start?" candidate. This affects Cinema Mode only.
 */
export function isWantToWatch(entry: LibraryEntry): boolean {
  return entry.status === 'want';
}

/**
 * Whether a title is released/available *now* — Cinema Mode answers "what should I watch
 * now?", so known-future titles are excluded. Tolerant of older saved data:
 * - a known future release date → not released;
 * - else a known future release year → not released;
 * - missing/unknown date and year → treated as released (never auto-excluded).
 */
export function isReleased(snapshot: TitleSnapshot, now: Date = new Date()): boolean {
  if (snapshot.releaseDate) {
    const time = Date.parse(snapshot.releaseDate);
    if (!Number.isNaN(time)) return time <= now.getTime();
  }
  if (snapshot.releaseYear !== null && snapshot.releaseYear !== undefined) {
    return snapshot.releaseYear <= now.getFullYear();
  }
  return true; // unknown → eligible
}

/** Want-to-Watch entries of a media type, ignoring release status (drives empty-state copy). */
export function wantToWatchByType(entries: LibraryEntry[], mediaType: MediaType): LibraryEntry[] {
  return entries.filter((entry) => isWantToWatch(entry) && entry.mediaType === mediaType);
}

/** The eligible Cinema Mode pool: Want to Watch + selected media type + released now. */
export function eligibleCandidates(
  entries: LibraryEntry[],
  mediaType: MediaType,
  now: Date = new Date(),
): LibraryEntry[] {
  return wantToWatchByType(entries, mediaType).filter((entry) => isReleased(entry.snapshot, now));
}

/** Default media type: Movies if any eligible movie, else TV if any eligible show, else Movies. */
export function defaultCinemaType(entries: LibraryEntry[], now: Date = new Date()): MediaType {
  if (eligibleCandidates(entries, 'movie', now).length > 0) return 'movie';
  if (eligibleCandidates(entries, 'tv', now).length > 0) return 'tv';
  return 'movie';
}
