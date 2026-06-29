import { Link } from 'react-router-dom';
import { routes } from '@/config/routes';
import { tmdbImageUrl } from '@/data/tmdb/images';
import type { TmdbTitle } from '@/domain/types';
import { Poster } from '@/shared/ui';
import { useTrackedEntry } from '@/stores/libraryStore';
import { StatusMenu } from './StatusMenu';

/** A compact list row with a quick add/status action. */
export function TrackableTitleRow({ title }: { title: TmdbTitle }) {
  const entry = useTrackedEntry(title.mediaType, title.tmdbId);
  return (
    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-bg-surface">
      <Link
        to={routes.title(title.mediaType, title.tmdbId)}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Poster
          src={tmdbImageUrl(title.posterPath, 'w185')}
          alt={title.title}
          className="w-12 shrink-0"
        />
        <div className="min-w-0">
          <p className="truncate text-sm text-text-primary">{title.title}</p>
          {title.releaseYear ? (
            <p className="text-xs text-text-secondary">{title.releaseYear}</p>
          ) : null}
        </div>
      </Link>
      <StatusMenu title={title} entry={entry} variant="compact" />
    </div>
  );
}
