import { Link } from 'react-router-dom';
import { Clapperboard, Film, WifiOff } from 'lucide-react';
import { routes } from '@/config/routes';
import {
  usePopularAnime,
  usePopularMovies,
  usePopularTv,
  useTrendingMovies,
  useUpcomingMovies,
} from '@/data/tmdb/queries/homeRails';
import { useRecommendations } from '@/data/tmdb/queries/useRecommendations';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { Button, EmptyState } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { Rail } from './components/Rail';
import { RecentRail } from './components/RecentRail';
import { RecommendationsRail } from './components/RecommendationsRail';

export function HomeScreen() {
  const online = useOnlineStatus();
  const entries = useLibraryStore((s) => Object.values(s.entries));
  const recent = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12);

  const trending = useTrendingMovies();
  const popular = usePopularMovies();
  const upcoming = useUpcomingMovies();
  const popularTv = usePopularTv();
  const anime = usePopularAnime();
  const rec = useRecommendations();

  const rails = [trending, popular, upcoming, popularTv, anime];
  const railsLoading = rails.some((r) => r.isLoading);
  const railsHaveContent = rails.some((r) => (r.data?.length ?? 0) > 0);

  // Graceful fallback if everything remote failed AND there's nothing local to show.
  const showAllFailedFallback =
    online &&
    !railsLoading &&
    !railsHaveContent &&
    !rec.isLoading &&
    rec.items.length === 0 &&
    recent.length === 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-text-primary">Home</h1>
        <Button asChild variant="gold">
          <Link to={routes.cinema}>
            <Clapperboard className="h-4 w-4" aria-hidden="true" /> Cinema Mode
          </Link>
        </Button>
      </div>

      {recent.length > 0 ? <RecentRail entries={recent} /> : null}

      {!online ? (
        <EmptyState
          icon={<WifiOff className="h-10 w-10" aria-hidden="true" />}
          title="You're offline"
          description="Trending and discovery need a connection. Your saved titles are still available here and in Your Library."
        />
      ) : showAllFailedFallback ? (
        <EmptyState
          icon={<Film className="h-10 w-10" aria-hidden="true" />}
          title="Couldn't load right now"
          description="We couldn't reach the movie database. Check your connection, or browse and add titles to your library."
          action={
            <Button asChild variant="secondary">
              <Link to={routes.discover}>Go to Discover</Link>
            </Button>
          }
        />
      ) : (
        <>
          <RecommendationsRail heading={rec.heading} items={rec.items} isLoading={rec.isLoading} />
          <Rail
            title="Trending this week"
            titles={trending.data}
            isLoading={trending.isLoading}
            isError={trending.isError}
          />
          <Rail
            title="Popular movies"
            titles={popular.data}
            isLoading={popular.isLoading}
            isError={popular.isError}
          />
          <Rail
            title="Upcoming movies"
            titles={upcoming.data}
            isLoading={upcoming.isLoading}
            isError={upcoming.isError}
          />
          <Rail
            title="Popular TV"
            titles={popularTv.data}
            isLoading={popularTv.isLoading}
            isError={popularTv.isError}
          />
          <Rail
            title="Popular anime"
            titles={anime.data}
            isLoading={anime.isLoading}
            isError={anime.isError}
          />
        </>
      )}
    </div>
  );
}
