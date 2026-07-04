import { describe, expect, it } from 'vitest';
import {
  buildRecapPayload,
  getWeeklyRecapConfig,
  isWeeklyRecapConfigured,
  type RecapMovieInput,
} from './weeklyRecapWebhook';

const NOW = new Date('2026-07-05T09:00:00.000Z');
const KEY = 'demo-key';

describe('buildRecapPayload', () => {
  it('maps a complete movie and keeps the stored watch date', () => {
    const movie: RecapMovieInput = {
      movieId: 27205,
      title: 'Inception',
      posterUrl: 'https://image.tmdb.org/t/p/w500/x.jpg',
      rating: 9,
      review: 'Great.',
      watchedAt: '2026-07-01',
    };
    const p = buildRecapPayload('watched', movie, KEY, NOW);

    expect(p.eventType).toBe('movie_activity');
    expect(p.source).toBe('watchverse');
    expect(p.activityType).toBe('watched');
    expect(p.automationKey).toBe(KEY);
    expect(p.movieId).toBe('27205'); // coerced to string
    expect(p.title).toBe('Inception');
    expect(p.rating).toBe(9);
    expect(p.review).toBe('Great.');
    expect(p.watchedAt).toBe('2026-07-01');
    expect(p.updatedAt).toBe(NOW.toISOString());
    expect(p.createdAt).toBe(NOW.toISOString());
    expect(p.eventId.length).toBeGreaterThan(0);
  });

  it('defaults watchedAt to now for a watched event with no stored date', () => {
    expect(buildRecapPayload('watched', {}, KEY, NOW).watchedAt).toBe(NOW.toISOString());
  });

  it('leaves watchedAt null for non-watched events without a stored date', () => {
    expect(buildRecapPayload('rating_updated', { rating: 8 }, KEY, NOW).watchedAt).toBeNull();
  });

  it('applies safe fallbacks for missing/invalid fields', () => {
    const p = buildRecapPayload(
      'review_updated',
      { movieId: null, title: '  ', posterUrl: null, rating: Number.NaN, review: '   ' },
      KEY,
      NOW,
    );
    expect(p.title).toBe('Unknown title');
    expect(p.movieId).toBe('');
    expect(p.posterUrl).toBe('');
    expect(p.rating).toBeNull();
    expect(p.review).toBeNull();
  });

  it('generates a unique eventId per call', () => {
    const a = buildRecapPayload('test_event', {}, KEY, NOW);
    const b = buildRecapPayload('test_event', {}, KEY, NOW);
    expect(a.eventId).not.toBe(b.eventId);
  });
});

describe('configuration', () => {
  it('reports not-configured and empty config when env vars are unset (test default)', () => {
    expect(isWeeklyRecapConfigured()).toBe(false);
    expect(getWeeklyRecapConfig()).toEqual({ webhookUrl: '', automationKey: '' });
  });
});
