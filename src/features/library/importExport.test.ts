import { describe, expect, it } from 'vitest';
import { defaultProfile, defaultSettings } from '@/domain/defaults';
import { createLibraryEntry } from '@/domain/library';
import type { WatchVerseExport } from '@/domain/types';
import { backupFilename, parseImportFile } from './importExport';

function validExport(): WatchVerseExport {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '0.0.0',
    data: {
      entries: [
        createLibraryEntry({
          tmdbId: 1,
          mediaType: 'movie',
          snapshot: { title: 'A', posterPath: null, releaseYear: 2020 },
        }),
      ],
      collections: [],
      tags: [],
      profile: defaultProfile(),
      settings: defaultSettings(),
      activity: [],
      achievements: [],
      searchHistory: [],
    },
  };
}

describe('parseImportFile', () => {
  it('parses a valid export', () => {
    expect(parseImportFile(JSON.stringify(validExport()))).not.toBeNull();
  });
  it('returns null for invalid JSON', () => {
    expect(parseImportFile('not json')).toBeNull();
  });
  it('returns null for valid JSON with the wrong shape', () => {
    expect(parseImportFile('{"foo":1}')).toBeNull();
  });
});

describe('backupFilename', () => {
  it('uses the date', () => {
    expect(backupFilename(new Date('2026-06-28T12:00:00.000Z'))).toBe(
      'watchverse-backup-2026-06-28.json',
    );
  });
});
