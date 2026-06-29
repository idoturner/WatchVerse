import { useState } from 'react';
import { tmdbImageUrl } from '@/data/tmdb/images';
import type { LibraryEntry, TitleSeason } from '@/domain/types';
import { Button, Card, Poster } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';

export interface TvSeasonsPanelProps {
  seasons: TitleSeason[];
  entry: LibraryEntry | undefined;
  spoilerProtection: boolean;
}

/**
 * Season-level TV tracking. Lists seasons (from TMDB); when the show is tracked,
 * lets the user set the current season, mark seasons complete, and complete the
 * show. Per-episode tracking is intentionally out of scope (the model is ready).
 */
export function TvSeasonsPanel({ seasons, entry, spoilerProtection }: TvSeasonsPanelProps) {
  const setCurrentSeason = useLibraryStore((s) => s.setCurrentSeason);
  const toggleSeasonCompleted = useLibraryStore((s) => s.toggleSeasonCompleted);
  const setShowCompleted = useLibraryStore((s) => s.setShowCompleted);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const tv = entry?.tv ?? null;
  if (seasons.length === 0) return null;

  const reveal = (seasonNumber: number) => setRevealed((prev) => new Set(prev).add(seasonNumber));

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-text-primary">Seasons</h2>
        {entry && tv ? (
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={tv.isShowCompleted}
              onChange={(e) => void setShowCompleted(entry.id, e.target.checked)}
            />
            Show completed
          </label>
        ) : null}
      </div>

      <ul className="space-y-2">
        {seasons.map((season) => {
          const isCurrent = tv?.currentSeason === season.seasonNumber;
          const isCompleted = tv?.completedSeasons.includes(season.seasonNumber) ?? false;
          const watched = isCurrent || isCompleted || (tv?.isShowCompleted ?? false);
          const hideSpoilers = spoilerProtection && !watched && !revealed.has(season.seasonNumber);

          return (
            <li key={season.seasonNumber}>
              <Card className="flex items-center gap-3 p-3">
                <Poster
                  src={tmdbImageUrl(season.posterPath, 'w185')}
                  alt={season.name}
                  className="w-12 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{season.name}</p>
                  <p className="text-xs text-text-secondary">
                    {season.episodeCount} episodes
                    {season.airDate ? ` · ${season.airDate.slice(0, 4)}` : ''}
                  </p>
                  {season.overview ? (
                    hideSpoilers ? (
                      // Spoiler text is NOT rendered to the DOM, so it is hidden from
                      // assistive technologies too — only revealed on intentional action.
                      <div className="mt-1">
                        <p className="text-xs italic text-text-tertiary">
                          Overview hidden to avoid spoilers
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 px-0"
                          aria-label={`Reveal overview for ${season.name}`}
                          onClick={() => reveal(season.seasonNumber)}
                        >
                          Reveal
                        </Button>
                      </div>
                    ) : (
                      <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                        {season.overview}
                      </p>
                    )
                  ) : null}
                </div>

                {entry && tv ? (
                  <div className="flex shrink-0 items-center gap-3">
                    {isCurrent ? (
                      <span className="rounded-full border border-status-watching px-2 py-0.5 text-xs text-status-watching">
                        Current
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void setCurrentSeason(entry.id, season.seasonNumber)}
                      >
                        Set current
                      </Button>
                    )}
                    <label className="flex items-center gap-1 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        aria-label={`Mark ${season.name} complete`}
                        onChange={() => void toggleSeasonCompleted(entry.id, season.seasonNumber)}
                      />
                      Done
                    </label>
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
