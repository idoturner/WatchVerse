import { WatchVerseExportSchema } from '@/domain/schemas';
import type { WatchVerseExport } from '@/domain/types';

/** Parse + validate an import file's text. Returns null for invalid JSON or shape. */
export function parseImportFile(text: string): WatchVerseExport | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const result = WatchVerseExportSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

/** Timestamped backup filename, e.g. watchverse-backup-2026-06-28.json. */
export function backupFilename(date: Date = new Date()): string {
  return `watchverse-backup-${date.toISOString().slice(0, 10)}.json`;
}
