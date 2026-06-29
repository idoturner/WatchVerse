import type { WatchStatus } from './types';

/** Canonical display order of the five watch statuses. */
export const STATUS_ORDER: WatchStatus[] = ['want', 'watching', 'completed', 'on_hold', 'dropped'];

/** Canonical, human-readable labels — the single source for status text. */
export const STATUS_LABELS: Record<WatchStatus, string> = {
  want: 'Want to Watch',
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
};
