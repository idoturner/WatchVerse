import { LayoutGrid, List } from 'lucide-react';
import type { SortKey } from '@/domain/types';
import type { TmdbGenre } from '@/data/tmdb/tmdb.schemas';
import { Button, Select } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { DiscoverUiParams } from '../hooks/useDiscoverParams';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
];

const YEARS: number[] = Array.from(
  { length: new Date().getFullYear() - 1949 },
  (_, i) => new Date().getFullYear() - i,
);

export interface FilterBarProps {
  params: DiscoverUiParams;
  genres: TmdbGenre[];
  update: (patch: Partial<DiscoverUiParams>) => void;
}

export function FilterBar({ params, genres, update }: FilterBarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {/* Media type */}
      <div
        className="inline-flex overflow-hidden rounded-md border border-border-strong"
        role="group"
        aria-label="Media type"
      >
        <Button
          variant={params.mediaType === 'movie' ? 'primary' : 'ghost'}
          size="sm"
          className="rounded-none"
          aria-pressed={params.mediaType === 'movie'}
          onClick={() => update({ mediaType: 'movie', genreId: null })}
        >
          Movies
        </Button>
        <Button
          variant={params.mediaType === 'tv' ? 'primary' : 'ghost'}
          size="sm"
          className="rounded-none"
          aria-pressed={params.mediaType === 'tv'}
          onClick={() => update({ mediaType: 'tv', genreId: null })}
        >
          TV Shows
        </Button>
      </div>

      <Select
        aria-label="Filter by genre"
        value={params.genreId ?? ''}
        onChange={(e) => update({ genreId: e.target.value ? Number(e.target.value) : null })}
      >
        <option value="">All genres</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filter by year"
        value={params.year ?? ''}
        onChange={(e) => update({ year: e.target.value ? Number(e.target.value) : null })}
      >
        <option value="">All years</option>
        {YEARS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Sort by"
        value={params.sortKey}
        onChange={(e) => update({ sortKey: e.target.value as SortKey })}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {/* View toggle */}
      <div className="ml-auto inline-flex overflow-hidden rounded-md border border-border-strong">
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={params.view === 'grid'}
          onClick={() => update({ view: 'grid' })}
          className={cn(
            'grid h-9 w-9 place-items-center',
            params.view === 'grid'
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:bg-bg-surface',
          )}
        >
          <LayoutGrid aria-hidden="true" className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="List view"
          aria-pressed={params.view === 'list'}
          onClick={() => update({ view: 'list' })}
          className={cn(
            'grid h-9 w-9 place-items-center',
            params.view === 'list'
              ? 'bg-accent text-white'
              : 'text-text-secondary hover:bg-bg-surface',
          )}
        >
          <List aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
