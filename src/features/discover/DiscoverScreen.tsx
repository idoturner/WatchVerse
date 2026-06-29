import { SearchX, WifiOff } from 'lucide-react';
import { useDiscoverTitles } from '@/data/tmdb/queries/useDiscoverTitles';
import { useGenres } from '@/data/tmdb/queries/useGenres';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { Button, EmptyState, Skeleton } from '@/shared/ui';
import { FilterBar } from './components/FilterBar';
import { ResultsGrid } from './components/ResultsGrid';
import { useDiscoverParams } from './hooks/useDiscoverParams';

function LoadingGrid() {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <li key={i}>
          <Skeleton className="aspect-[2/3]" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

export function DiscoverScreen() {
  const { params, update } = useDiscoverParams();
  const online = useOnlineStatus();
  const genresQuery = useGenres(params.mediaType);
  const discover = useDiscoverTitles({
    mediaType: params.mediaType,
    query: params.query,
    genreId: params.genreId,
    year: params.year,
    sortKey: params.sortKey,
  });

  const titles = discover.data?.pages.flatMap((page) => page.titles) ?? [];
  const isSearch = params.query.trim().length > 0;
  const heading = isSearch ? `Results for “${params.query}”` : 'Discover';

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-bold text-text-primary">{heading}</h1>
      <FilterBar params={params} genres={genresQuery.data ?? []} update={update} />

      {!online ? (
        <EmptyState
          icon={<WifiOff className="h-10 w-10" aria-hidden="true" />}
          title="You're offline"
          description="Search and discovery need a connection. Your saved library is still available."
        />
      ) : discover.isLoading ? (
        <LoadingGrid />
      ) : discover.isError ? (
        <EmptyState
          icon={<SearchX className="h-10 w-10" aria-hidden="true" />}
          title="Something went wrong"
          description="We couldn't load titles from the movie database."
          action={<Button onClick={() => void discover.refetch()}>Try again</Button>}
        />
      ) : titles.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-10 w-10" aria-hidden="true" />}
          title={isSearch ? 'No results found' : 'Nothing to show'}
          description={
            isSearch
              ? 'Try a different search, or adjust your genre and year filters.'
              : 'Try adjusting your filters.'
          }
        />
      ) : (
        <>
          <ResultsGrid titles={titles} view={params.view} />
          {discover.hasNextPage ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                onClick={() => void discover.fetchNextPage()}
                disabled={discover.isFetchingNextPage}
              >
                {discover.isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
