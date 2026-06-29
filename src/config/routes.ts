import type { MediaType } from '@/domain/types';

/** Canonical route paths and path builders. */
export const routes = {
  home: '/',
  dashboard: '/dashboard',
  discover: '/discover',
  library: '/library',
  cinema: '/cinema',
  collections: '/collections',
  settings: '/settings',
  collection: (id: string) => `/collections/${id}`,
  title: (mediaType: MediaType, id: number | string) => `/title/${mediaType}/${id}`,
} as const;
