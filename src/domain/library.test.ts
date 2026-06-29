import { describe, expect, it } from 'vitest';
import { clampRewatchCount, isValidWatchDate, normalizeReview, todayDate } from './library';

describe('normalizeReview', () => {
  it('trims whitespace', () => {
    expect(normalizeReview('  Great ending.  ')).toBe('Great ending.');
  });
  it('returns null for empty/whitespace', () => {
    expect(normalizeReview('   ')).toBeNull();
    expect(normalizeReview('')).toBeNull();
  });
  it('caps at 500 characters', () => {
    expect(normalizeReview('x'.repeat(600))).toHaveLength(500);
  });
});

describe('clampRewatchCount', () => {
  it('floors at zero and to an integer', () => {
    expect(clampRewatchCount(-3)).toBe(0);
    expect(clampRewatchCount(2.9)).toBe(2);
    expect(clampRewatchCount(5)).toBe(5);
  });
});

describe('isValidWatchDate', () => {
  it('accepts a real past date and today', () => {
    expect(isValidWatchDate('2020-01-15')).toBe(true);
    expect(isValidWatchDate(todayDate())).toBe(true);
  });
  it('rejects bad format, invalid dates, and future dates', () => {
    expect(isValidWatchDate('not-a-date')).toBe(false);
    expect(isValidWatchDate('2020-13-40')).toBe(false);
    expect(isValidWatchDate('2999-01-01')).toBe(false);
  });
});
