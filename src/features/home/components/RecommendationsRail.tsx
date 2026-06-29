import type { Recommendation } from '@/domain/recommendations';
import { TrackableTitleCard } from '@/features/library';
import { Rail } from './Rail';

export interface RecommendationsRailProps {
  heading: string;
  items: Recommendation[];
  isLoading: boolean;
}

/** Recommendations rail with a transparent per-card reason caption. */
export function RecommendationsRail({ heading, items, isLoading }: RecommendationsRailProps) {
  if (isLoading) return <Rail title={heading} titles={undefined} isLoading isError={false} />;
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">{heading}</h2>
      <ul className="flex gap-4 overflow-x-auto pb-2">
        {items.map(({ title, reason }) => (
          <li key={`${title.mediaType}:${title.tmdbId}`} className="w-36 shrink-0">
            <TrackableTitleCard title={title} />
            {reason ? (
              <p className="mt-1 line-clamp-2 text-xs text-text-tertiary">{reason}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
