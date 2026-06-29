import { env } from '@/config/env';

export type TmdbErrorKind =
  'offline' | 'rate_limited' | 'not_found' | 'unauthorized' | 'unexpected';

/** Typed TMDB error mapped to the app's error vocabulary (Architecture Overview §9). */
export class TmdbError extends Error {
  constructor(
    public readonly kind: TmdbErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

type QueryParams = Record<string, string | number | undefined>;

/**
 * Low-level TMDB fetch. Returns raw JSON (`unknown`) — callers validate with Zod at
 * the boundary so TMDB shapes never leak inward (docs/03-architecture/tmdb-integration.md).
 */
export async function tmdbFetch(path: string, params: QueryParams = {}): Promise<unknown> {
  if (!env.tmdbAccessToken) {
    throw new TmdbError('unauthorized', 'Missing TMDB access token (set VITE_TMDB_ACCESS_TOKEN).');
  }

  const url = new URL(`${env.tmdbApiBase}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.tmdbAccessToken}`, accept: 'application/json' },
    });
  } catch {
    throw new TmdbError('offline', 'Could not reach the movie database.');
  }

  if (response.status === 401)
    throw new TmdbError('unauthorized', 'TMDB rejected the credentials.');
  if (response.status === 404) throw new TmdbError('not_found', 'That title could not be found.');
  if (response.status === 429) throw new TmdbError('rate_limited', 'TMDB rate limit reached.');
  if (!response.ok) throw new TmdbError('unexpected', `TMDB request failed (${response.status}).`);

  return response.json();
}
