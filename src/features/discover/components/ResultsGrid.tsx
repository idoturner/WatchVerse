import type { TmdbTitle } from '@/domain/types';
import { TrackableTitleCard, TrackableTitleRow } from '@/features/library';

export interface ResultsGridProps {
  titles: TmdbTitle[];
  view: 'grid' | 'list';
}

function titleKey(title: TmdbTitle): string {
  return `${title.mediaType}:${title.tmdbId}`;
}

/** Renders results as a responsive poster grid or a compact list, with quick actions. */
export function ResultsGrid({ titles, view }: ResultsGridProps) {
  if (view === 'list') {
    return (
      <ul className="flex flex-col gap-2">
        {titles.map((title) => (
          <li key={titleKey(title)}>
            <TrackableTitleRow title={title} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
      {titles.map((title) => (
        <li key={titleKey(title)}>
          <TrackableTitleCard title={title} />
        </li>
      ))}
    </ul>
  );
}
