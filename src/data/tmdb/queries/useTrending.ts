import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import type { MediaType, TmdbTitle } from '@/domain/types';
import { mapListItemToTitle } from '../tmdb.mappers';
import { TmdbListResponseSchema } from '../tmdb.schemas';
import { tmdbFetch } from '../tmdbClient';

/** Trending movies or TV for the week, validated and mapped to domain titles. */
export function useTrending(mediaType: MediaType) {
  return useQuery({
    queryKey: queryKeys.trending(mediaType),
    queryFn: async (): Promise<TmdbTitle[]> => {
      const raw = await tmdbFetch(`/trending/${mediaType}/week`);
      const parsed = TmdbListResponseSchema.parse(raw);
      return parsed.results.map((item) => mapListItemToTitle(item, mediaType));
    },
  });
}
