import { Link } from 'react-router-dom';
import { routes } from '@/config/routes';
import { tmdbImageUrl } from '@/data/tmdb/images';
import type { TmdbTitle, WatchStatus } from '@/domain/types';
import { Poster } from './Poster';
import { StatusBadge } from './StatusBadge';

/** Poster-led card linking to a title's detail page; shows library status if tracked. */
export function TitleCard({ title, status }: { title: TmdbTitle; status?: WatchStatus }) {
  return (
    <Link
      to={routes.title(title.mediaType, title.tmdbId)}
      className="group block rounded-md"
      aria-label={`${title.title}${title.releaseYear ? ` (${title.releaseYear})` : ''}`}
    >
      <div className="relative">
        <Poster
          src={tmdbImageUrl(title.posterPath)}
          alt={title.title}
          className="transition-transform duration-base group-hover:scale-[1.02]"
        />
        {status ? <StatusBadge status={status} className="absolute left-2 top-2" /> : null}
      </div>
      <p className="mt-2 truncate text-sm text-text-primary">{title.title}</p>
      {title.releaseYear ? (
        <p className="text-xs text-text-secondary">{title.releaseYear}</p>
      ) : null}
    </Link>
  );
}
