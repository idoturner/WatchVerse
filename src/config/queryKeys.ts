import type { MediaType, SortKey } from '@/domain/types';

export interface DiscoverKeyParams {
  mediaType: MediaType;
  query: string;
  genreId: number | null;
  year: number | null;
  sortKey: SortKey;
}

/** Centralized TanStack Query keys for consistency and easy invalidation. */
export const queryKeys = {
  trending: (mediaType: MediaType) => ['trending', mediaType] as const,
  genres: (mediaType: MediaType) => ['genres', mediaType] as const,
  discover: (params: DiscoverKeyParams) => ['discover', params] as const,
  titleDetail: (mediaType: MediaType, id: number) => ['title', mediaType, id] as const,
  rail: (id: string) => ['rail', id] as const,
  searchSuggest: (query: string) => ['search-suggest', query] as const,
} as const;
