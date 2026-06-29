import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { routes } from '@/config/routes';
import { tmdbImageUrl } from '@/data/tmdb/images';
import type { LibraryEntry, TmdbTitle } from '@/domain/types';
import { EntryTagChips } from '@/features/tags';
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

/** Library grid card built from a tracked entry (poster, status, rating, quick actions). */
export function LibraryCard({ entry }: { entry: LibraryEntry }) {
  return (
    <div className="relative">
      <Link
        to={routes.title(entry.mediaType, entry.tmdbId)}
        className="group block rounded-md"
        aria-label={entry.snapshot.title}
      >
        <div className="relative">
          <Poster
            src={tmdbImageUrl(entry.snapshot.posterPath)}
            alt={entry.snapshot.title}
            className="transition-transform duration-base group-hover:scale-[1.02]"
          />
          <StatusBadge status={entry.status} className="absolute left-2 top-2" />
        </div>
        <p className="mt-2 truncate text-sm text-text-primary">{entry.snapshot.title}</p>
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{entry.snapshot.releaseYear ?? ''}</span>
          {entry.rating !== null ? (
            <span className="inline-flex items-center gap-0.5 text-highlight">
              <Star className="h-3 w-3 fill-highlight" aria-hidden="true" />
              {entry.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <EntryTagChips tagIds={entry.tagIds} />
      </Link>
      <div className="absolute right-2 top-2">
        <StatusMenu title={trackableFromEntry(entry)} entry={entry} variant="compact" />
      </div>
    </div>
  );
}
