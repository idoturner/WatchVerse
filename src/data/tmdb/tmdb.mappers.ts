import type {
  CastMember,
  MediaType,
  TitleDetail,
  TitleSeason,
  TitleTrailer,
  TmdbTitle,
} from '@/domain/types';
import type { TmdbListItem, TmdbMovieDetail, TmdbTvDetail, TmdbVideos } from './tmdb.schemas';

function yearFromDate(date: string | undefined): number | null {
  if (!date) return null;
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

/** Map a TMDB list item (DTO) into the domain TmdbTitle. */
export function mapListItemToTitle(item: TmdbListItem, fallbackMediaType: MediaType): TmdbTitle {
  const mediaType: MediaType =
    item.media_type === 'movie' || item.media_type === 'tv' ? item.media_type : fallbackMediaType;

  return {
    tmdbId: item.id,
    mediaType,
    title: item.title ?? item.name ?? 'Untitled',
    overview: item.overview ?? '',
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    releaseYear: yearFromDate(item.release_date ?? item.first_air_date),
    releaseDate: item.release_date ?? item.first_air_date ?? null,
    voteAverage: item.vote_average ?? null,
    genreIds: item.genre_ids ?? [],
  };
}

function mapCast(
  cast: { id: number; name: string; character?: string; profile_path?: string | null }[],
): CastMember[] {
  return cast.slice(0, 12).map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character ?? null,
    profilePath: member.profile_path ?? null,
  }));
}

/** Choose the best trailer: an official YouTube trailer, then any trailer/teaser. */
function pickTrailer(videos: TmdbVideos | undefined): TitleTrailer | null {
  const results = (videos?.results ?? []).filter((video) => video.site === 'YouTube');
  const chosen =
    results.find((video) => video.type === 'Trailer' && video.official) ??
    results.find((video) => video.type === 'Trailer') ??
    results.find((video) => video.type === 'Teaser') ??
    results[0];
  return chosen ? { key: chosen.key, site: chosen.site, name: chosen.name } : null;
}

function mapSeasons(seasons: TmdbTvDetail['seasons']): TitleSeason[] {
  return [...(seasons ?? [])]
    .sort((a, b) => a.season_number - b.season_number)
    .map((season) => ({
      seasonNumber: season.season_number,
      name: season.name ?? `Season ${season.season_number}`,
      episodeCount: season.episode_count ?? 0,
      airDate: season.air_date ?? null,
      posterPath: season.poster_path ?? null,
      overview: season.overview ?? '',
    }));
}

export function mapMovieDetail(raw: TmdbMovieDetail): TitleDetail {
  return {
    tmdbId: raw.id,
    mediaType: 'movie',
    title: raw.title ?? 'Untitled',
    overview: raw.overview ?? '',
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    releaseYear: yearFromDate(raw.release_date),
    releaseDate: raw.release_date ?? null,
    runtimeMinutes: raw.runtime ?? null,
    genres: raw.genres.map((genre) => ({ id: genre.id, name: genre.name })),
    voteAverage: raw.vote_average ?? null,
    tagline: raw.tagline ?? null,
    cast: mapCast(raw.credits?.cast ?? []),
    directors: (raw.credits?.crew ?? []).filter((c) => c.job === 'Director').map((c) => c.name),
    trailer: pickTrailer(raw.videos),
    similar: (raw.similar?.results ?? []).map((item) => mapListItemToTitle(item, 'movie')),
    seasons: [],
  };
}

export function mapTvDetail(raw: TmdbTvDetail): TitleDetail {
  return {
    tmdbId: raw.id,
    mediaType: 'tv',
    title: raw.name ?? 'Untitled',
    overview: raw.overview ?? '',
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    releaseYear: yearFromDate(raw.first_air_date),
    releaseDate: raw.first_air_date ?? null,
    runtimeMinutes: raw.episode_run_time?.[0] ?? null,
    genres: raw.genres.map((genre) => ({ id: genre.id, name: genre.name })),
    voteAverage: raw.vote_average ?? null,
    tagline: raw.tagline ?? null,
    cast: mapCast(raw.credits?.cast ?? []),
    directors: (raw.created_by ?? []).map((creator) => creator.name),
    trailer: pickTrailer(raw.videos),
    similar: (raw.similar?.results ?? []).map((item) => mapListItemToTitle(item, 'tv')),
    seasons: mapSeasons(raw.seasons),
  };
}
