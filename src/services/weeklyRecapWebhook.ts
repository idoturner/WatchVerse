import { nanoid } from 'nanoid';
import { tmdbImageUrl } from '@/data/tmdb/images';
import type { LibraryEntry } from '@/domain/types';

/**
 * Weekly WatchVerse Recap — a small, optional, fire-and-forget integration that POSTs movie
 * activity events to an n8n webhook. n8n (not this app) stores rows in Google Sheets and sends
 * the weekly email. WatchVerse stays frontend-only and fully functional if this is unconfigured.
 *
 * The webhook URL and automation key come from Vite env vars (visible in the browser bundle, so
 * NOT a real secret — n8n must still validate `source`/`automationKey`/`eventType`). See
 * docs/weekly-watchverse-recap.md.
 */

export type RecapActivityType = 'watched' | 'rating_updated' | 'review_updated' | 'test_event';

/** Loose input describing a movie for an event; every field is optional and defended. */
export interface RecapMovieInput {
  movieId?: string | number | null;
  title?: string | null;
  posterUrl?: string | null;
  rating?: number | null;
  review?: string | null;
  watchedAt?: string | null;
}

/** The exact JSON shape sent to n8n. */
export interface RecapPayload {
  eventId: string;
  eventType: 'movie_activity';
  automationKey: string;
  source: 'watchverse';
  activityType: RecapActivityType;
  movieId: string;
  title: string;
  posterUrl: string;
  rating: number | null;
  review: string | null;
  watchedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

export type RecapSendResult =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'request_failed'; message: string };

export interface WeeklyRecapConfig {
  webhookUrl: string;
  automationKey: string;
}

/** Read the (trimmed) env configuration. Both values may be empty. */
export function getWeeklyRecapConfig(): WeeklyRecapConfig {
  return {
    webhookUrl: (import.meta.env.VITE_WEEKLY_RECAP_WEBHOOK_URL ?? '').trim(),
    automationKey: (import.meta.env.VITE_WEEKLY_RECAP_AUTOMATION_KEY ?? '').trim(),
  };
}

/** Automation is "on" only when a webhook URL is present. */
export function isWeeklyRecapConfigured(): boolean {
  return getWeeklyRecapConfig().webhookUrl.length > 0;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

/** Pure: build the webhook payload with safe fallbacks for missing fields. */
export function buildRecapPayload(
  activityType: RecapActivityType,
  movie: RecapMovieInput,
  automationKey: string,
  now: Date = new Date(),
): RecapPayload {
  const iso = now.toISOString();
  const rating =
    typeof movie.rating === 'number' && Number.isFinite(movie.rating) ? movie.rating : null;
  const storedWatchedAt = nonEmptyString(movie.watchedAt);

  return {
    eventId: nanoid(),
    eventType: 'movie_activity',
    automationKey,
    source: 'watchverse',
    activityType,
    movieId: movie.movieId != null && movie.movieId !== '' ? String(movie.movieId) : '',
    title: nonEmptyString(movie.title) ?? 'Unknown title',
    posterUrl: nonEmptyString(movie.posterUrl) ?? '',
    rating,
    review: nonEmptyString(movie.review),
    // Use the stored watch date when present; for a fresh "watched" event fall back to now.
    watchedAt: storedWatchedAt ?? (activityType === 'watched' ? iso : null),
    updatedAt: iso,
    createdAt: iso,
  };
}

function warnDev(message: string, error?: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(`[WatchVerse] ${message}`, error ?? '');
  }
}

/**
 * POST a movie activity event to the configured webhook. Never throws; returns a result the
 * caller may inspect (the Test button does; normal actions ignore it). No-op if not configured.
 */
export async function sendMovieActivity(
  activityType: RecapActivityType,
  movie: RecapMovieInput,
): Promise<RecapSendResult> {
  const { webhookUrl, automationKey } = getWeeklyRecapConfig();
  if (!webhookUrl) {
    return { ok: false, reason: 'not_configured', message: 'Weekly Recap webhook URL is not set.' };
  }

  const payload = buildRecapPayload(activityType, movie, automationKey);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      warnDev(`Weekly Recap webhook responded with HTTP ${response.status}.`);
      return { ok: false, reason: 'request_failed', message: `Webhook responded ${response.status}.` };
    }
    return { ok: true };
  } catch (error) {
    warnDev('Weekly Recap webhook request failed.', error);
    return { ok: false, reason: 'request_failed', message: 'Could not reach the webhook.' };
  }
}

/**
 * Fire-and-forget helper for the library store: map a tracked entry to an event and send it in
 * the background. Never throws and never blocks the caller; silently no-ops when unconfigured.
 */
export function notifyMovieActivity(activityType: RecapActivityType, entry: LibraryEntry): void {
  if (!isWeeklyRecapConfigured()) return;
  const movie: RecapMovieInput = {
    movieId: entry.tmdbId,
    title: entry.snapshot.title,
    posterUrl: tmdbImageUrl(entry.snapshot.posterPath),
    rating: entry.rating,
    review: entry.review,
    watchedAt: entry.watchedAt,
  };
  void sendMovieActivity(activityType, movie);
}
