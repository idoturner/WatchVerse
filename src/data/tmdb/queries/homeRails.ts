import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { filterDisplayableTitles, UPCOMING_WINDOW_MONTHS } from '@/domain/contentQuality';
import { fetchTitleList } from '../fetchTitleList';

/** YYYY-MM-DD for a date (UTC), as TMDB date-filter params expect. */
function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function useTrendingMovies() {
  return useQuery({
    queryKey: queryKeys.rail('trending-movie'),
    queryFn: async () =>
      filterDisplayableTitles(await fetchTitleList('/trending/movie/week', 'movie')),
  });
}

export function usePopularMovies() {
  return useQuery({
    queryKey: queryKeys.rail('popular-movie'),
    queryFn: async () => filterDisplayableTitles(await fetchTitleList('/movie/popular', 'movie')),
  });
}

/**
 * Genuine upcoming releases only: TMDB Discover constrained to a today→+18mo window
 * (server-side), so far-future placeholders (e.g. sequels dated years out) never appear.
 * The display-quality filter then drops any remaining art-less records.
 */
export function useUpcomingMovies() {
  return useQuery({
    queryKey: queryKeys.rail('upcoming-movie'),
    queryFn: async () => {
      const today = new Date();
      const windowEnd = new Date(today);
      windowEnd.setMonth(windowEnd.getMonth() + UPCOMING_WINDOW_MONTHS);
      const titles = await fetchTitleList('/discover/movie', 'movie', {
        sort_by: 'popularity.desc',
        include_adult: 'false',
        'primary_release_date.gte': isoDate(today),
        'primary_release_date.lte': isoDate(windowEnd),
      });
      return filterDisplayableTitles(titles);
    },
  });
}

export function usePopularTv() {
  return useQuery({
    queryKey: queryKeys.rail('popular-tv'),
    queryFn: async () => filterDisplayableTitles(await fetchTitleList('/tv/popular', 'tv')),
  });
}

/** "Popular Anime": curated TMDB Discover query (animation + Japanese origin). */
export function usePopularAnime() {
  return useQuery({
    queryKey: queryKeys.rail('popular-anime'),
    queryFn: async () =>
      filterDisplayableTitles(
        await fetchTitleList('/discover/tv', 'tv', {
          with_genres: 16,
          with_original_language: 'ja',
          sort_by: 'popularity.desc',
        }),
      ),
  });
}
