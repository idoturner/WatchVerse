import { useSearchParams } from 'react-router-dom';
import { SortKeyEnum } from '@/domain/enums';
import type { MediaType, SortKey } from '@/domain/types';

export interface DiscoverUiParams {
  query: string;
  mediaType: MediaType;
  genreId: number | null;
  year: number | null;
  sortKey: SortKey;
  view: 'grid' | 'list';
}

function parseSort(value: string | null): SortKey {
  const result = SortKeyEnum.safeParse(value);
  // "Popular" (relevance) is the default browse sort — "Newest" surfaces too much
  // obscure/placeholder TMDB data to lead with.
  return result.success ? result.data : 'popular';
}

function parseNumber(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Reads and writes the Discover screen's state from the URL (shareable/restorable). */
export function useDiscoverParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: DiscoverUiParams = {
    query: searchParams.get('q') ?? '',
    mediaType: searchParams.get('type') === 'tv' ? 'tv' : 'movie',
    genreId: parseNumber(searchParams.get('genre')),
    year: parseNumber(searchParams.get('year')),
    sortKey: parseSort(searchParams.get('sort')),
    view: searchParams.get('view') === 'list' ? 'list' : 'grid',
  };

  const update = (patch: Partial<DiscoverUiParams>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const set = (key: string, value: string | number | null, fallback: string) => {
          if (value === null || value === '' || String(value) === fallback) next.delete(key);
          else next.set(key, String(value));
        };
        if ('query' in patch) set('q', patch.query ?? '', '');
        if ('mediaType' in patch) set('type', patch.mediaType ?? 'movie', 'movie');
        if ('genreId' in patch) set('genre', patch.genreId ?? null, '');
        if ('year' in patch) set('year', patch.year ?? null, '');
        if ('sortKey' in patch) set('sort', patch.sortKey ?? 'popular', 'popular');
        if ('view' in patch) set('view', patch.view ?? 'grid', 'grid');
        return next;
      },
      { replace: true },
    );
  };

  return { params, update };
}
