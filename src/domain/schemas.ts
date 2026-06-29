import { z } from 'zod';
import { ActivityTypeEnum, MediaTypeEnum, SortKeyEnum, WatchStatusEnum } from './enums';

/**
 * Zod schemas are the single source of truth for domain data; TypeScript types
 * are inferred from them (see types.ts). All persisted/imported data is validated
 * against these before use (docs/03-architecture/state-and-persistence.md §5.3).
 */

export const TitleSnapshotSchema = z.object({
  title: z.string(),
  posterPath: z.string().nullable(),
  releaseYear: z.number().int().nullable(),
  // Optional + nullable so libraries saved before this field stay valid (older entries
  // simply have no date → treated as "release unknown"). Enables released-now checks.
  releaseDate: z.string().nullable().optional(),
});

export const TvProgressSchema = z.object({
  currentSeason: z.number().int().positive().nullable(),
  completedSeasons: z.array(z.number().int().positive()),
  isShowCompleted: z.boolean(),
});

export const LibraryEntrySchema = z.object({
  id: z.string(),
  tmdbId: z.number().int(),
  mediaType: MediaTypeEnum,
  snapshot: TitleSnapshotSchema,
  status: WatchStatusEnum,
  rating: z.number().min(0.5).max(10).multipleOf(0.5).nullable(),
  review: z.string().max(500).nullable(),
  watchedAt: z.string().nullable(),
  rewatchCount: z.number().int().nonnegative(),
  tv: TvProgressSchema.nullable(),
  collectionIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ProfileSchema = z.object({
  displayName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SettingsSchema = z.object({
  defaultView: z.enum(['grid', 'list']),
  defaultSort: SortKeyEnum,
  posterDensity: z.enum(['comfortable', 'compact']),
  reducedMotion: z.enum(['system', 'on', 'off']),
  theme: z.literal('cinema-dark'),
  defaultLanding: z.enum(['home', 'library', 'dashboard']),
  confirmBeforeDelete: z.boolean(),
  autoplayTrailers: z.boolean(),
  spoilerProtection: z.boolean(),
  contentLanguage: z.string(),
  // `.catch` keeps settings persisted before this field valid (missing → false, no
  // quarantine) without the input/output type divergence that `.default` introduces.
  onboardingCompleted: z.boolean().catch(false),
  updatedAt: z.string(),
});

export const ActivitySchema = z.object({
  id: z.string(),
  type: ActivityTypeEnum,
  refId: z.string().nullable(),
  label: z.string(),
  createdAt: z.string(),
});

export const AchievementRecordSchema = z.object({
  achievementId: z.string(),
  unlockedAt: z.string(),
});

export const SearchHistoryItemSchema = z.object({
  query: z.string(),
  createdAt: z.string(),
});

export const MetaSchema = z.object({
  schemaVersion: z.number().int(),
  lastBackupAt: z.string().nullable(),
});

export const WatchVerseExportSchema = z.object({
  schemaVersion: z.number().int(),
  exportedAt: z.string(),
  appVersion: z.string(),
  data: z.object({
    entries: z.array(LibraryEntrySchema),
    collections: z.array(CollectionSchema),
    tags: z.array(TagSchema),
    profile: ProfileSchema,
    settings: SettingsSchema,
    activity: z.array(ActivitySchema),
    achievements: z.array(AchievementRecordSchema),
    searchHistory: z.array(SearchHistoryItemSchema),
  }),
});

/** Stored-shape schemas (normalized keyed maps / arrays). */
export const EntriesRecordSchema = z.record(z.string(), LibraryEntrySchema);
export const CollectionsRecordSchema = z.record(z.string(), CollectionSchema);
export const TagsRecordSchema = z.record(z.string(), TagSchema);
export const AchievementsRecordSchema = z.record(z.string(), AchievementRecordSchema);
export const ActivityArraySchema = z.array(ActivitySchema);
export const SearchHistoryArraySchema = z.array(SearchHistoryItemSchema);
