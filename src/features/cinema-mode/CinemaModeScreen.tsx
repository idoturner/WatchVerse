import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Clapperboard, Eye, Play } from 'lucide-react';
import { routes } from '@/config/routes';
import { tmdbImageUrl } from '@/data/tmdb/images';
import type { LibraryEntry, MediaType } from '@/domain/types';
import { cn } from '@/shared/lib/cn';
import { Button, EmptyState, Poster } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { defaultCinemaType, eligibleCandidates, wantToWatchByType } from './eligibility';
import { pickRandomEntry } from './pickRandom';
import { buildRollFrames, rollFrameDelay } from './roll';

type Phase = 'idle' | 'rolling' | 'settled';

/** Resolve the in-app reduced-motion setting to a boolean (mirrors AppLayout/MotionConfig). */
function useReducedMotionEnabled(): boolean {
  const preference = useSettingsStore((s) => s.settings.reducedMotion);
  const systemReduced = useReducedMotion() ?? false;
  if (preference === 'on') return true;
  if (preference === 'off') return false;
  return systemReduced;
}

/** Premium random picker from the user's watchlist (Want to Watch / Watching), released now. */
export function CinemaModeScreen() {
  const entries = useLibraryStore((s) => Object.values(s.entries));
  const setStatus = useLibraryStore((s) => s.setStatus);
  const reducedMotion = useReducedMotionEnabled();

  const [mediaType, setMediaType] = useState<MediaType>(() => defaultCinemaType(entries));
  const [phase, setPhase] = useState<Phase>('idle');
  const [display, setDisplay] = useState<LibraryEntry | null>(null);
  const lastPickId = useRef<string | undefined>(undefined);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pool = useMemo(() => eligibleCandidates(entries, mediaType), [entries, mediaType]);
  const wantOfType = useMemo(() => wantToWatchByType(entries, mediaType), [entries, mediaType]);
  const hasEntriesOfType = useMemo(
    () => entries.some((e) => e.mediaType === mediaType),
    [entries, mediaType],
  );

  useEffect(() => {
    return () => {
      if (rollTimer.current) clearTimeout(rollTimer.current);
    };
  }, []);

  const settle = (entry: LibraryEntry) => {
    if (rollTimer.current) {
      clearTimeout(rollTimer.current);
      rollTimer.current = null;
    }
    lastPickId.current = entry.id;
    setDisplay(entry);
    setPhase('settled');
  };

  const spin = () => {
    if (phase === 'rolling') return; // never overlap rolls
    // Selection is unchanged: same picker + repeat-avoidance, only the pool is scoped to the
    // selected media type and released-now titles.
    const final = pickRandomEntry(pool, lastPickId.current);
    if (!final) return;

    if (reducedMotion) {
      settle(final);
      return;
    }

    const frames = buildRollFrames(pool, final);
    setPhase('rolling');
    let i = 0;
    const step = () => {
      setDisplay(frames[i] ?? final);
      if (i >= frames.length - 1) {
        settle(final);
        return;
      }
      const delay = rollFrameDelay(i, frames.length);
      i += 1;
      rollTimer.current = setTimeout(step, delay);
    };
    step();
  };

  const changeType = (next: MediaType) => {
    if (next === mediaType) return;
    if (rollTimer.current) {
      clearTimeout(rollTimer.current);
      rollTimer.current = null;
    }
    setPhase('idle');
    setDisplay(null);
    setMediaType(next);
  };

  const markWatching = async (entry: LibraryEntry) => {
    await setStatus(entry.id, 'watching');
    setDisplay((current) =>
      current && current.id === entry.id ? { ...current, status: 'watching' } : current,
    );
  };

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Clapperboard className="h-10 w-10" aria-hidden="true" />}
        title="Your watchlist is empty"
        description="Add titles to Want to Watch, then come back and let WatchVerse pick for you."
        action={
          <Button asChild>
            <Link to={routes.discover}>Find something to watch</Link>
          </Button>
        }
      />
    );
  }

  const rolling = phase === 'rolling';
  const settled = phase === 'settled';
  const typeNoun = mediaType === 'movie' ? 'movies' : 'TV shows';

  // Accurate empty-state copy for the selected type (only used when the pool is empty).
  let emptyPrimary: string;
  let emptySecondary: string;
  if (wantOfType.length > 0) {
    // Has Want-to-Watch titles of this type, but none are released yet.
    emptyPrimary = `Your saved ${typeNoun} here aren’t released yet.`;
    emptySecondary = 'Try the other type or add something available now.';
  } else if (hasEntriesOfType) {
    // Has titles of this type, but none are Want to Watch (Watching/Completed/On Hold/Dropped).
    emptyPrimary = `No Want to Watch ${typeNoun} available for Cinema Mode.`;
    emptySecondary = 'Move titles to Want to Watch to include them here.';
  } else {
    emptyPrimary = `No ${typeNoun} ready to start.`;
    emptySecondary = 'Add titles to Want to Watch, or try the other type.';
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="font-display text-2xl font-bold text-text-primary">Cinema Mode</h1>
      <p className="mt-1 text-text-secondary">A random pick from your watchlist.</p>

      <div
        role="group"
        aria-label="Cinema Mode media type"
        className="mt-5 inline-flex overflow-hidden rounded-md border border-border-strong"
      >
        <Button
          variant={mediaType === 'movie' ? 'primary' : 'ghost'}
          size="sm"
          className="rounded-none"
          aria-pressed={mediaType === 'movie'}
          onClick={() => changeType('movie')}
        >
          Movies
        </Button>
        <Button
          variant={mediaType === 'tv' ? 'primary' : 'ghost'}
          size="sm"
          className="rounded-none"
          aria-pressed={mediaType === 'tv'}
          onClick={() => changeType('tv')}
        >
          TV Shows
        </Button>
      </div>

      {pool.length === 0 ? (
        <div className="mt-10">
          <p className="font-medium text-text-primary">{emptyPrimary}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-secondary">{emptySecondary}</p>
          <div className="mt-4">
            <Button asChild variant="secondary">
              <Link to={routes.discover}>Find something to watch</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 min-h-[20rem]">
          {display ? (
            // Intermediate roll frames must not be announced — only the settled pick is.
            <div aria-hidden={rolling}>
              <motion.div
                key={settled ? `pick-${display.id}` : 'rolling'}
                initial={settled ? { opacity: 0.5, scale: 0.96 } : false}
                animate={settled ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <div
                  className={cn(
                    'mx-auto w-48 rounded-md transition-shadow duration-base',
                    settled &&
                      'shadow-[0_0_45px_-5px_rgba(230,180,80,0.5)] ring-2 ring-highlight/60',
                  )}
                >
                  <Poster
                    src={tmdbImageUrl(display.snapshot.posterPath)}
                    alt={display.snapshot.title}
                  />
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-text-primary">
                  {display.snapshot.title}
                </h2>
                {display.snapshot.releaseYear ? (
                  <p className="text-sm text-text-secondary">{display.snapshot.releaseYear}</p>
                ) : null}
              </motion.div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {!display ? (
              <Button size="lg" onClick={spin}>
                <Clapperboard className="h-4 w-4" aria-hidden="true" /> Spin the reel
              </Button>
            ) : rolling ? (
              <Button size="lg" disabled>
                <Clapperboard className="h-4 w-4" aria-hidden="true" /> Rolling…
              </Button>
            ) : (
              <>
                <Button asChild variant="secondary">
                  <Link to={routes.title(display.mediaType, display.tmdbId)}>
                    <Eye className="h-4 w-4" aria-hidden="true" /> View Details
                  </Link>
                </Button>
                {display.status === 'want' ? (
                  <Button onClick={() => void markWatching(display)}>
                    <Play className="h-4 w-4" aria-hidden="true" /> Mark as Watching
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={spin}>
                  Spin Again
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Announce only the final selection to screen readers. */}
      <div className="sr-only" role="status" aria-live="polite">
        {settled && display ? `Selected: ${display.snapshot.title}` : ''}
      </div>
    </div>
  );
}
