/** App-wide constants. Single home for storage keys, versions, and caps. */

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

/** LocalStorage namespace prefix and stable key-namespace version. */
export const STORAGE_NAMESPACE = 'watchverse';
export const STORAGE_KEY_VERSION = 'v1';

/** Data-shape version; bumped when domain shapes change (drives migrations). */
export const CURRENT_SCHEMA_VERSION = 1;

/** Logical names for each persisted slice (combined with namespace + version). */
export const STORAGE_KEYS = {
  entries: 'entries',
  collections: 'collections',
  tags: 'tags',
  profile: 'profile',
  settings: 'settings',
  activity: 'activity',
  achievements: 'achievements',
  searchHistory: 'searchHistory',
  meta: 'meta',
} as const;

/** Bounded stores (protect the ~5MB LocalStorage budget). */
export const ACTIVITY_CAP = 500;
export const SEARCH_HISTORY_CAP = 15;
