import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import type { MediaType } from '@/domain/types';
import { TmdbGenreListResponseSchema, type TmdbGenre } from '../tmdb.schemas';
import { tmdbFetch } from '../tmdbClient';

/** Genre list for the given media type (cached aggressively — genres rarely change). */
export function useGenres(mediaType: MediaType) {
  return useQuery({
    queryKey: queryKeys.genres(mediaType),
    queryFn: async (): Promise<TmdbGenre[]> => {
      const raw = await tmdbFetch(`/genre/${mediaType}/list`);
      return TmdbGenreListResponseSchema.parse(raw).genres;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
}
