import type { z } from 'zod';
import type {
  AchievementRecordSchema,
  ActivitySchema,
  CollectionSchema,
  LibraryEntrySchema,
  ProfileSchema,
  SearchHistoryItemSchema,
  SettingsSchema,
  TagSchema,
  TitleSnapshotSchema,
  TvProgressSchema,
  WatchVerseExportSchema,
} from './schemas';

export type { WatchStatus, MediaType, ActivityType, SortKey } from './enums';

export type TitleSnapshot = z.infer<typeof TitleSnapshotSchema>;
export type TvProgress = z.infer<typeof TvProgressSchema>;
export type LibraryEntry = z.infer<typeof LibraryEntrySchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type AchievementRecord = z.infer<typeof AchievementRecordSchema>;
export type SearchHistoryItem = z.infer<typeof SearchHistoryItemSchema>;
export type WatchVerseExport = z.infer<typeof WatchVerseExportSchema>;

/**
 * Catalog title mapped from TMDB (server-state). Kept deliberately separate from
 * LibraryEntry (user data) — docs/03-architecture/data-models.md §1.
 */
export interface TmdbTitle {
  tmdbId: number;
  mediaType: import('./enums').MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: number | null;
  /** Full release/first-air date (ISO `YYYY-MM-DD`) when known — enables date-window quality rules. */
  releaseDate: string | null;
  voteAverage: number | null;
  genreIds: number[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
}

export interface TitleTrailer {
  key: string;
  site: string;
  name: string;
}

export interface TitleSeason {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
  overview: string;
}

/** Full detail of a single title, composed from TMDB and mapped to the domain. */
export interface TitleDetail {
  tmdbId: number;
  mediaType: import('./enums').MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: number | null;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  genres: { id: number; name: string }[];
  voteAverage: number | null;
  tagline: string | null;
  cast: CastMember[];
  directors: string[];
  trailer: TitleTrailer | null;
  similar: TmdbTitle[];
  /** TV seasons (empty for movies). */
  seasons: TitleSeason[];
}
