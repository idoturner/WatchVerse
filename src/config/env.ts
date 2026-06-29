/**
 * Typed access to environment configuration. Defaults keep the app importable
 * without a .env; the TMDB token is required only when a TMDB request is made
 * (see tmdbClient). The token is exposed client-side by design — see
 * docs/03-architecture/security-and-privacy.md.
 */
export const env = {
  tmdbApiBase: import.meta.env.VITE_TMDB_API_BASE ?? 'https://api.themoviedb.org/3',
  tmdbImageBase: import.meta.env.VITE_TMDB_IMAGE_BASE ?? 'https://image.tmdb.org/t/p',
  tmdbAccessToken: import.meta.env.VITE_TMDB_ACCESS_TOKEN ?? '',
} as const;
