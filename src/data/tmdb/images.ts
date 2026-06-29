import { env } from '@/config/env';

/** Build a TMDB image URL for a given path/size; returns null when no path. */
export function tmdbImageUrl(path: string | null, size: string = 'w500'): string | null {
  if (!path) return null;
  return `${env.tmdbImageBase}/${size}${path}`;
}
