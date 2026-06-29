import type { MediaType, TmdbTitle } from '@/domain/types';
import { mapListItemToTitle } from './tmdb.mappers';
import { TmdbListResponseSchema } from './tmdb.schemas';
import { tmdbFetch } from './tmdbClient';

type Params = Record<string, string | number | undefined>;

/** Fetch a TMDB list endpoint, validate, and map to domain titles (movie/tv only). */
export async function fetchTitleList(
  path: string,
  mediaType: MediaType,
  params: Params = {},
): Promise<TmdbTitle[]> {
  const raw = await tmdbFetch(path, params);
  return TmdbListResponseSchema.parse(raw)
    .results.filter((item) => item.media_type === undefined || item.media_type === mediaType)
    .map((item) => mapListItemToTitle(item, mediaType));
}
