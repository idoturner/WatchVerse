import type { TmdbTitle } from './types';

/** How far ahead (months) a movie may release to count as genuine "upcoming". */
export const UPCOMING_WINDOW_MONTHS = 18;

export interface QualityOptions {
  /** Reference "now" for date math; injectable for deterministic tests. */
  now?: Date;
  /**
   * Poster-first surfaces (rails, default browse) require a poster so cards never show
   * an empty placeholder. Set false to accept a poster *or* a backdrop. Default true.
   */
  requirePoster?: boolean;
  /** Movies releasing more than this many months ahead are treated as far-future placeholders. */
  maxFutureMonths?: number;
}

function hasUsableTitle(title: TmdbTitle): boolean {
  const text = title.title.trim();
  // The mapper falls back to "Untitled" for records with no title/name.
  return text.length > 0 && text !== 'Untitled';
}

function hasUsableArtwork(title: TmdbTitle, requirePoster: boolean): boolean {
  if (requirePoster) return title.posterPath !== null;
  return title.posterPath !== null || title.backdropPath !== null;
}

/** A movie whose release is implausibly far in the future (placeholder-like). TV is unaffected. */
function isFarFutureMovie(title: TmdbTitle, now: Date, maxFutureMonths: number): boolean {
  if (title.mediaType !== 'movie') return false;
  if (title.releaseDate === null) return false; // unknown date isn't "far future" on its own
  const release = new Date(title.releaseDate);
  if (Number.isNaN(release.getTime())) return false;
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() + maxFutureMonths);
  return release.getTime() > cutoff.getTime();
}

/**
 * Whether a TMDB title is good enough to feature in default, poster-first browse
 * surfaces (home rails, recommendations, default Discover, similar). Pure and
 * deterministic. Direct search should NOT use this — searches are intent-explicit
 * and may legitimately surface sparse/future records.
 */
export function isDisplayableTitle(title: TmdbTitle, options: QualityOptions = {}): boolean {
  const {
    now = new Date(),
    requirePoster = true,
    maxFutureMonths = UPCOMING_WINDOW_MONTHS,
  } = options;
  return (
    hasUsableTitle(title) &&
    hasUsableArtwork(title, requirePoster) &&
    !isFarFutureMovie(title, now, maxFutureMonths)
  );
}

/** Filter a list down to titles fit for default poster-first surfaces. Returns a new array. */
export function filterDisplayableTitles(
  titles: TmdbTitle[],
  options?: QualityOptions,
): TmdbTitle[] {
  return titles.filter((title) => isDisplayableTitle(title, options));
}
