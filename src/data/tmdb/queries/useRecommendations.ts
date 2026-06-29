import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryKeys';
import { filterDisplayableTitles } from '@/domain/contentQuality';
import {
  combineRecommendations,
  pickSeedEntries,
  type Recommendation,
} from '@/domain/recommendations';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { useLibraryStore } from '@/stores/libraryStore';
import { fetchTitleList } from '../fetchTitleList';

export interface RecommendationResult {
  mode: 'personalized' | 'fallback';
  heading: string;
  items: Recommendation[];
  isLoading: boolean;
}

/**
 * Transparent, rules-based recommendations (no AI). Personalized from the user's
 * strongest library signals; falls back to a distinct "get started" set (top-rated,
 * not the Popular rail) when there isn't enough data — and never pretends to be
 * personalized in that case.
 */
export function useRecommendations(): RecommendationResult {
  const online = useOnlineStatus();
  const entries = useLibraryStore((s) => Object.values(s.entries));
  const seeds = useMemo(() => pickSeedEntries(entries, 3), [entries]);
  const libraryKeys = useMemo(
    () => new Set(entries.map((e) => `${e.mediaType}:${e.tmdbId}`)),
    [entries],
  );

  const seedQueries = useQueries({
    queries: seeds.map((seed) => ({
      queryKey: queryKeys.rail(`rec-${seed.mediaType}-${seed.tmdbId}`),
      queryFn: () =>
        fetchTitleList(`/${seed.mediaType}/${seed.tmdbId}/recommendations`, seed.mediaType),
      enabled: online,
    })),
  });

  // Distinct from the Home "Popular movies" rail to avoid redundant content.
  const fallbackQuery = useQuery({
    queryKey: queryKeys.rail('rec-fallback'),
    queryFn: () => fetchTitleList('/movie/top_rated', 'movie'),
    enabled: online,
  });

  const fallback = (): RecommendationResult => ({
    mode: 'fallback',
    heading: 'Popular picks to get started',
    items: filterDisplayableTitles(fallbackQuery.data ?? [])
      .filter((t) => !libraryKeys.has(`${t.mediaType}:${t.tmdbId}`))
      .slice(0, 18)
      .map((title) => ({ title, reason: '' })),
    isLoading: fallbackQuery.isLoading,
  });

  if (seeds.length === 0) return fallback();

  const isLoading = seedQueries.some((q) => q.isLoading);
  const groups = seeds.map((seed, i) => ({
    seedTitle: seed.snapshot.title,
    titles: filterDisplayableTitles(seedQueries[i]?.data ?? []),
  }));
  const items = combineRecommendations(groups, libraryKeys);

  if (!isLoading && items.length === 0) return fallback();
  return { mode: 'personalized', heading: 'Recommended for you', items, isLoading };
}
