import type { TmdbTitle } from '@/domain/types';
import { TitleCard } from '@/shared/ui';
import { useTrackedEntry } from '@/stores/libraryStore';
import { StatusMenu } from './StatusMenu';

/** A poster card with a quick add/status action overlay. */
export function TrackableTitleCard({ title }: { title: TmdbTitle }) {
  const entry = useTrackedEntry(title.mediaType, title.tmdbId);
  return (
    <div className="relative">
      <TitleCard title={title} status={entry?.status} />
      <div className="absolute right-2 top-2">
        <StatusMenu title={title} entry={entry} variant="compact" />
      </div>
    </div>
  );
}
