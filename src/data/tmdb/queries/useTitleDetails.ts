import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { filterDisplayableTitles } from '@/domain/contentQuality';
import type { MediaType, TitleDetail } from '@/domain/types';
import { mapMovieDetail, mapTvDetail } from '../tmdb.mappers';
import { TmdbMovieDetailSchema, TmdbTvDetailSchema } from '../tmdb.schemas';
import { TmdbError, tmdbFetch } from '../tmdbClient';

/** Full detail for a movie or TV title (credits, videos, similar), validated and mapped. */
export function useTitleDetails(mediaType: MediaType, id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.titleDetail(mediaType, id),
    enabled,
    queryFn: async (): Promise<TitleDetail> => {
      const raw = await tmdbFetch(`/${mediaType}/${id}`, {
        append_to_response: 'credits,videos,similar',
      });
      const detail =
        mediaType === 'movie'
          ? mapMovieDetail(TmdbMovieDetailSchema.parse(raw))
          : mapTvDetail(TmdbTvDetailSchema.parse(raw));
      // "Similar" is a poster-first rail — drop placeholder/far-future records there too.
      return { ...detail, similar: filterDisplayableTitles(detail.similar) };
    },
    // Don't retry a genuine "not found" — it won't become found.
    retry: (failureCount, error) =>
      error instanceof TmdbError && error.kind === 'not_found' ? false : failureCount < 2,
  });
}
