import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { routes } from '@/config/routes';
import { tmdbImageUrl } from '@/data/tmdb/images';
import type { LibraryEntry, TmdbTitle } from '@/domain/types';
import { Poster, StatusBadge } from '@/shared/ui';
import { StatusMenu } from './StatusMenu';

function trackableFromEntry(
  entry: LibraryEntry,
): Pick<TmdbTitle, 'tmdbId' | 'mediaType' | 'title' | 'posterPath' | 'releaseYear' | 'releaseDate'> {
  return {
    tmdbId: entry.tmdbId,
    mediaType: entry.mediaType,
    title: entry.snapshot.title,
    posterPath: entry.snapshot.posterPath,
    releaseYear: entry.snapshot.releaseYear,
    releaseDate: entry.snapshot.releaseDate ?? null,
  };
}

/** Library list row built from a tracked entry. */
export function LibraryRow({ entry }: { entry: LibraryEntry }) {
  return (
    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-bg-surface">
      <Link
        to={routes.title(entry.mediaType, entry.tmdbId)}
        className="flex min-w-0 flex-1 items-center gap-3"
        aria-label={entry.snapshot.title}
      >
        <Poster
          src={tmdbImageUrl(entry.snapshot.posterPath, 'w185')}
          alt={entry.snapshot.title}
          className="w-12 shrink-0"
        />
        <div className="min-w-0">
          <p className="truncate text-sm text-text-primary">{entry.snapshot.title}</p>
          <p className="text-xs text-text-secondary">{entry.snapshot.releaseYear ?? ''}</p>
        </div>
      </Link>
      <StatusBadge status={entry.status} />
      {entry.rating !== null ? (
        <span className="inline-flex items-center gap-0.5 text-xs text-highlight">
          <Star className="h-3 w-3 fill-highlight" aria-hidden="true" />
          {entry.rating.toFixed(1)}
        </span>
      ) : null}
      <StatusMenu title={trackableFromEntry(entry)} entry={entry} variant="compact" />
    </div>
  );
}
