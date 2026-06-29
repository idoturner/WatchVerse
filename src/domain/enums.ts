import { z } from 'zod';

export const WatchStatusEnum = z.enum(['want', 'watching', 'completed', 'on_hold', 'dropped']);
export type WatchStatus = z.infer<typeof WatchStatusEnum>;

export const MediaTypeEnum = z.enum(['movie', 'tv']);
export type MediaType = z.infer<typeof MediaTypeEnum>;

export const ActivityTypeEnum = z.enum([
  'added',
  'status_changed',
  'completed_show',
  'rated',
  'reviewed',
  'collection_created',
  'achievement_unlocked',
]);
export type ActivityType = z.infer<typeof ActivityTypeEnum>;

export const SortKeyEnum = z.enum([
  'popular',
  'az',
  'za',
  'newest',
  'oldest',
  'date_added',
  'rating',
]);
export type SortKey = z.infer<typeof SortKeyEnum>;
