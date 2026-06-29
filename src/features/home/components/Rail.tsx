import type { TmdbTitle } from '@/domain/types';
import { TrackableTitleCard } from '@/features/library';
import { Skeleton } from '@/shared/ui';

function RailSkeleton() {
  return (
    <ul className="flex gap-4 overflow-x-auto pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="w-36 shrink-0">
          <Skeleton className="aspect-[2/3]" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

export interface RailProps {
  title: string;
  titles: TmdbTitle[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

/** A horizontal poster rail. Hides itself if it errors or has no content. */
export function Rail({ title, titles, isLoading, isError }: RailProps) {
  if (isError) return null;
  if (!isLoading && (!titles || titles.length === 0)) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">{title}</h2>
      {isLoading ? (
        <RailSkeleton />
      ) : (
        <ul className="flex gap-4 overflow-x-auto pb-2">
          {(titles ?? []).map((item) => (
            <li key={`${item.mediaType}:${item.tmdbId}`} className="w-36 shrink-0">
              <TrackableTitleCard title={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
