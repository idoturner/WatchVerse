import { z } from 'zod';

/**
 * Zod schemas for the subset of TMDB responses used in Phase 1. Validated at the
 * boundary; fields are optional/nullable to tolerate TMDB's looseness safely.
 */
export const TmdbListItemSchema = z.object({
  id: z.number(),
  media_type: z.enum(['movie', 'tv']).optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  overview: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  first_air_date: z.string().optional(),
  vote_average: z.number().optional(),
  genre_ids: z.array(z.number()).optional(),
});
export type TmdbListItem = z.infer<typeof TmdbListItemSchema>;

export const TmdbListResponseSchema = z.object({
  page: z.number(),
  results: z.array(TmdbListItemSchema),
  total_pages: z.number().optional(),
  total_results: z.number().optional(),
});
export type TmdbListResponse = z.infer<typeof TmdbListResponseSchema>;

export const TmdbGenreSchema = z.object({ id: z.number(), name: z.string() });
export type TmdbGenre = z.infer<typeof TmdbGenreSchema>;

export const TmdbGenreListResponseSchema = z.object({ genres: z.array(TmdbGenreSchema) });

// --- Detail (append_to_response=credits,videos,similar) ---

const TmdbCastSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string().optional(),
  profile_path: z.string().nullable().optional(),
});

const TmdbCrewSchema = z.object({
  id: z.number(),
  name: z.string(),
  job: z.string().optional(),
});

const TmdbCreditsSchema = z.object({
  cast: z.array(TmdbCastSchema).default([]),
  crew: z.array(TmdbCrewSchema).default([]),
});

const TmdbVideoSchema = z.object({
  key: z.string(),
  site: z.string(),
  type: z.string(),
  name: z.string(),
  official: z.boolean().optional(),
});

const TmdbVideosSchema = z.object({ results: z.array(TmdbVideoSchema).default([]) });
export type TmdbVideos = z.infer<typeof TmdbVideosSchema>;

const TmdbCreatedBySchema = z.object({ id: z.number(), name: z.string() });

const TmdbSeasonSchema = z.object({
  season_number: z.number(),
  name: z.string().optional(),
  episode_count: z.number().optional(),
  air_date: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
});

export const TmdbMovieDetailSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  runtime: z.number().nullable().optional(),
  genres: z.array(TmdbGenreSchema).default([]),
  vote_average: z.number().optional(),
  tagline: z.string().nullable().optional(),
  credits: TmdbCreditsSchema.optional(),
  videos: TmdbVideosSchema.optional(),
  similar: TmdbListResponseSchema.optional(),
});
export type TmdbMovieDetail = z.infer<typeof TmdbMovieDetailSchema>;

export const TmdbTvDetailSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  overview: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  first_air_date: z.string().optional(),
  episode_run_time: z.array(z.number()).optional(),
  genres: z.array(TmdbGenreSchema).default([]),
  vote_average: z.number().optional(),
  tagline: z.string().nullable().optional(),
  created_by: z.array(TmdbCreatedBySchema).optional(),
  seasons: z.array(TmdbSeasonSchema).optional(),
  credits: TmdbCreditsSchema.optional(),
  videos: TmdbVideosSchema.optional(),
  similar: TmdbListResponseSchema.optional(),
});
export type TmdbTvDetail = z.infer<typeof TmdbTvDetailSchema>;
