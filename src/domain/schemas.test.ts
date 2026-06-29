import { describe, expect, it } from 'vitest';
import { LibraryEntrySchema, SettingsSchema } from './schemas';
import { createLibraryEntry } from './library';
import { defaultSettings } from './defaults';

function sampleEntry() {
  return createLibraryEntry({
    tmdbId: 1,
    mediaType: 'movie',
    snapshot: { title: 'Dune', posterPath: null, releaseYear: 2021 },
  });
}

describe('LibraryEntrySchema', () => {
  it('accepts a valid entry from the factory', () => {
    expect(LibraryEntrySchema.safeParse(sampleEntry()).success).toBe(true);
  });

  it('rejects a rating above 10', () => {
    expect(LibraryEntrySchema.safeParse({ ...sampleEntry(), rating: 11 }).success).toBe(false);
  });

  it('rejects a rating that is not a 0.5 step', () => {
    expect(LibraryEntrySchema.safeParse({ ...sampleEntry(), rating: 7.3 }).success).toBe(false);
  });

  it('accepts a valid half-step rating', () => {
    expect(LibraryEntrySchema.safeParse({ ...sampleEntry(), rating: 8.5 }).success).toBe(true);
  });

  it('rejects a review longer than 500 characters', () => {
    expect(
      LibraryEntrySchema.safeParse({ ...sampleEntry(), review: 'x'.repeat(501) }).success,
    ).toBe(false);
  });

  it('gives TV entries season progress and movies none', () => {
    const tv = createLibraryEntry({
      tmdbId: 2,
      mediaType: 'tv',
      snapshot: { title: 'Show', posterPath: null, releaseYear: 2019 },
    });
    expect(tv.tv).not.toBeNull();
    expect(sampleEntry().tv).toBeNull();
  });
});

describe('SettingsSchema', () => {
  it('accepts the default settings', () => {
    expect(SettingsSchema.safeParse(defaultSettings()).success).toBe(true);
  });
});
