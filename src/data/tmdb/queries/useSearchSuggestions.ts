import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import type { TmdbTitle } from '@/domain/types';
import { mapListItemToTitle } from '../tmdb.mappers';
import { TmdbListResponseSchema } from '../tmdb.schemas';
import { tmdbFetch } from '../tmdbClient';

/** A few title suggestions for the autocomplete dropdown (movies + TV). */
export function useSearchSuggestions(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: queryKeys.searchSuggest(q),
    enabled: q.length >= 2,
    queryFn: async (): Promise<TmdbTitle[]> => {
      const raw = await tmdbFetch('/search/multi', { query: q, page: 1, include_adult: 'false' });
      return TmdbListResponseSchema.parse(raw)
        .results.filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 6)
        .map((item) => mapListItemToTitle(item, item.media_type === 'tv' ? 'tv' : 'movie'));
    },
  });
}
