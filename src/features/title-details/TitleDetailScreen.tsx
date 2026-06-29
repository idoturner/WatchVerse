import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, SearchX, Star, WifiOff } from 'lucide-react';
import { routes } from '@/config/routes';
import { tmdbImageUrl } from '@/data/tmdb/images';
import { useTitleDetails } from '@/data/tmdb/queries/useTitleDetails';
import { TmdbError } from '@/data/tmdb/tmdbClient';
import type { MediaType } from '@/domain/types';
import { CollectionPicker } from '@/features/collections';
import { StatusMenu, TrackableTitleCard, TrackingPanel, TvSeasonsPanel } from '@/features/library';
import { TagPicker } from '@/features/tags';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { formatRuntime } from '@/shared/lib/format';
import { Button, Card, EmptyState, Poster } from '@/shared/ui';
import { useTrackedEntry } from '@/stores/libraryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { CastRow } from './components/CastRow';
import { DetailSkeleton } from './components/DetailSkeleton';

export function TitleDetailScreen() {
  const params = useParams();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const mediaType: MediaType | null =
    params.mediaType === 'movie' ? 'movie' : params.mediaType === 'tv' ? 'tv' : null;
  const id = Number(params.id);
  const valid = mediaType !== null && Number.isInteger(id) && id > 0;

  const query = useTitleDetails(mediaType ?? 'movie', id, valid && online);
  const entry = useTrackedEntry(mediaType ?? 'movie', id);
  const spoilerProtection = useSettingsStore((s) => s.settings.spoilerProtection);

  useEffect(() => {
    if (query.data) headingRef.current?.focus();
  }, [query.data]);

  const backButton = (
    <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
    </Button>
  );

  if (!valid) {
    return (
      <div className="py-10">
        {backButton}
        <EmptyState
          icon={<SearchX className="h-10 w-10" aria-hidden="true" />}
          title="Title not found"
          description="That link doesn't point to a valid title."
          action={<Button onClick={() => navigate(routes.home)}>Go to Discover</Button>}
        />
      </div>
    );
  }

  if (!online) {
    return (
      <div className="py-10">
        {backButton}
        <EmptyState
          icon={<WifiOff className="h-10 w-10" aria-hidden="true" />}
          title="You're offline"
          description="Title details need a connection. Your saved library is still available."
        />
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="py-6">
        {backButton}
        <DetailSkeleton />
      </div>
    );
  }

  if (query.isError || !query.data) {
    const notFound = query.error instanceof TmdbError && query.error.kind === 'not_found';
    return (
      <div className="py-10">
        {backButton}
        <EmptyState
          icon={<SearchX className="h-10 w-10" aria-hidden="true" />}
          title={notFound ? 'Title not found' : 'Something went wrong'}
          description={
            notFound
              ? "We couldn't find that title."
              : "We couldn't load this title from the movie database."
          }
          action={
            notFound ? (
              <Button onClick={() => navigate(routes.home)}>Go to Discover</Button>
            ) : (
              <Button onClick={() => void query.refetch()}>Try again</Button>
            )
          }
        />
      </div>
    );
  }

  const detail = query.data;
  const runtime = formatRuntime(detail.runtimeMinutes);
  const directorLabel =
    detail.mediaType === 'movie'
      ? detail.directors.length > 1
        ? 'Directors'
        : 'Director'
      : detail.directors.length > 1
        ? 'Creators'
        : 'Creator';
  const trailerUrl = detail.trailer
    ? `https://www.youtube.com/watch?v=${detail.trailer.key}`
    : null;

  return (
    <article className="relative pb-10">
      {detail.backdropPath ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 overflow-hidden"
        >
          <img
            src={tmdbImageUrl(detail.backdropPath, 'w1280') ?? undefined}
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-base" />
        </div>
      ) : null}

      {backButton}

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-40 shrink-0 md:w-56">
          <Poster src={tmdbImageUrl(detail.posterPath, 'w500')} alt={detail.title} />
        </div>

        <div className="flex-1">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-3xl font-bold text-text-primary outline-none"
          >
            {detail.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
            {detail.releaseYear ? <span>{detail.releaseYear}</span> : null}
            {runtime ? <span>{runtime}</span> : null}
            {detail.voteAverage ? (
              <span className="inline-flex items-center gap-1 text-highlight">
                <Star className="h-4 w-4" aria-hidden="true" />
                {detail.voteAverage.toFixed(1)}
                <span className="text-text-tertiary">TMDB</span>
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <StatusMenu
              title={{
                tmdbId: detail.tmdbId,
                mediaType: detail.mediaType,
                title: detail.title,
                posterPath: detail.posterPath,
                releaseYear: detail.releaseYear,
                releaseDate: detail.releaseDate,
              }}
              entry={entry}
              variant="full"
            />
          </div>

          {detail.genres.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {detail.genres.map((genre) => (
                <li
                  key={genre.id}
                  className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-text-secondary"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          ) : null}

          {detail.tagline ? (
            <p className="mt-4 italic text-text-secondary">{detail.tagline}</p>
          ) : null}

          {detail.overview ? (
            <p className="mt-4 max-w-2xl text-text-primary">{detail.overview}</p>
          ) : (
            <p className="mt-4 text-text-tertiary">No overview available.</p>
          )}

          {detail.directors.length > 0 ? (
            <p className="mt-4 text-sm text-text-secondary">
              <span className="text-text-tertiary">{directorLabel}: </span>
              {detail.directors.join(', ')}
            </p>
          ) : null}

          {trailerUrl ? (
            <a
              href={trailerUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Play trailer for ${detail.title} (opens YouTube in a new tab)`}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover"
            >
              <Play className="h-4 w-4" aria-hidden="true" /> Play trailer
            </a>
          ) : null}
        </div>
      </div>

      {entry ? (
        <section className="mt-8">
          <TrackingPanel entry={entry} />
        </section>
      ) : null}

      {entry ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">
              Collections
            </h2>
            <CollectionPicker entry={entry} />
          </Card>
          <Card className="p-4">
            <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">Tags</h2>
            <TagPicker entry={entry} />
          </Card>
        </section>
      ) : null}

      {detail.mediaType === 'tv' && detail.seasons.length > 0 ? (
        <TvSeasonsPanel
          seasons={detail.seasons}
          entry={entry}
          spoilerProtection={spoilerProtection}
        />
      ) : null}

      {detail.cast.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">Cast</h2>
          <CastRow cast={detail.cast} />
        </section>
      ) : null}

      {detail.similar.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
            More like this
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
            {detail.similar.map((title) => (
              <li key={`${title.mediaType}:${title.tmdbId}`}>
                <TrackableTitleCard title={title} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
