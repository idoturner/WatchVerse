import { create } from 'zustand';
import { getRepository } from '@/data/repository/activeRepository';
import {
  clampRewatchCount,
  createLibraryEntry,
  normalizeReview,
  todayDate,
  touchEntry,
} from '@/domain/library';
import { STATUS_LABELS } from '@/domain/status';
import type {
  ActivityType,
  LibraryEntry,
  MediaType,
  TitleSnapshot,
  WatchStatus,
} from '@/domain/types';
import { useActivityStore } from './activityStore';

function logActivity(type: ActivityType, label: string, refId: string | null): void {
  void useActivityStore.getState().log({ type, label, refId });
}

interface AddTitleInput {
  tmdbId: number;
  mediaType: MediaType;
  snapshot: TitleSnapshot;
  status?: WatchStatus;
}

interface LibraryState {
  entries: Record<string, LibraryEntry>;
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addTitle: (input: AddTitleInput) => Promise<LibraryEntry>;
  removeEntry: (id: string) => Promise<void>;
  restoreEntry: (entry: LibraryEntry) => Promise<void>;
  setStatus: (id: string, status: WatchStatus) => Promise<void>;
  setRating: (id: string, rating: number | null) => Promise<void>;
  setReview: (id: string, review: string | null) => Promise<void>;
  setWatchedAt: (id: string, watchedAt: string | null) => Promise<void>;
  setRewatchCount: (id: string, count: number) => Promise<void>;
  setCurrentSeason: (id: string, season: number | null) => Promise<void>;
  toggleSeasonCompleted: (id: string, season: number) => Promise<void>;
  setShowCompleted: (id: string, completed: boolean) => Promise<void>;
  toggleEntryCollection: (entryId: string, collectionId: string) => Promise<void>;
  detachCollection: (collectionId: string) => Promise<void>;
  toggleEntryTag: (entryId: string, tagId: string) => Promise<void>;
  detachTag: (tagId: string) => Promise<void>;
}

/**
 * Client-state store for the user's library. Reads/writes flow through the async
 * Repository; mutations are optimistic with rollback on failure (State & Persistence §4).
 * Actions express intent (addTitle/setStatus) rather than raw setters.
 */
export const useLibraryStore = create<LibraryState>((set, get) => {
  /**
   * Apply an optimistic, persisted update to a single entry. Returns the persisted
   * entry on success, `undefined` if the entry no longer exists, and throws (after
   * rolling back) if persistence fails — so callers can log activity strictly on
   * successful persistence.
   */
  const persistUpdate = async (
    id: string,
    update: (entry: LibraryEntry) => LibraryEntry,
  ): Promise<LibraryEntry | undefined> => {
    const previous = get().entries;
    const current = previous[id];
    if (!current) return undefined;

    const updated = touchEntry(update(current));
    set({ entries: { ...previous, [id]: updated } });
    try {
      await getRepository().upsertEntry(updated);
    } catch (err) {
      set({ entries: previous, error: 'Could not save your change. Please try again.' });
      throw err;
    }
    return updated;
  };

  return {
    entries: {},
    hydrated: false,
    error: null,

    async hydrate() {
      try {
        const list = await getRepository().getEntries();
        set({
          entries: Object.fromEntries(list.map((entry) => [entry.id, entry])),
          hydrated: true,
          error: null,
        });
      } catch {
        set({ hydrated: true, error: 'Could not load your library.' });
      }
    },

    async addTitle(input) {
      const entry = createLibraryEntry(input);
      const previous = get().entries;
      set({ entries: { ...previous, [entry.id]: entry } });
      try {
        await getRepository().upsertEntry(entry);
      } catch (err) {
        set({ entries: previous, error: 'Could not add the title. Please try again.' });
        throw err;
      }
      logActivity('added', `Added ${entry.snapshot.title}`, entry.id);
      return entry;
    },

    async removeEntry(id) {
      const previous = get().entries;
      const next = { ...previous };
      delete next[id];
      set({ entries: next });
      try {
        await getRepository().removeEntry(id);
      } catch (err) {
        set({ entries: previous, error: 'Could not remove the title. Please try again.' });
        throw err;
      }
    },

    async restoreEntry(entry) {
      const previous = get().entries;
      set({ entries: { ...previous, [entry.id]: entry } });
      try {
        await getRepository().upsertEntry(entry);
      } catch (err) {
        set({ entries: previous, error: 'Could not restore the title. Please try again.' });
        throw err;
      }
    },

    async setStatus(id, status) {
      // A single completion-oriented entry is logged for completion (not a separate
      // "status changed" + "completed" pair). Logged only on successful persistence.
      const updated = await persistUpdate(id, (entry) => {
        const next = { ...entry, status };
        // Completing a title sensibly defaults its watch date (editable). PRD-LIB-6.
        if (status === 'completed' && entry.watchedAt === null) {
          next.watchedAt = todayDate();
        }
        return next;
      });
      if (updated) {
        logActivity(
          'status_changed',
          status === 'completed'
            ? `Completed ${updated.snapshot.title}`
            : `Marked ${updated.snapshot.title} as ${STATUS_LABELS[status]}`,
          id,
        );
      }
    },

    async setRating(id, rating) {
      const updated = await persistUpdate(id, (entry) => ({ ...entry, rating }));
      if (updated && rating !== null) {
        logActivity('rated', `Rated ${updated.snapshot.title} ${rating}/10`, id);
      }
    },

    async setReview(id, review) {
      const updated = await persistUpdate(id, (entry) => ({
        ...entry,
        review: review === null ? null : normalizeReview(review),
      }));
      if (updated && updated.review !== null) {
        logActivity('reviewed', `Reviewed ${updated.snapshot.title}`, id);
      }
    },

    async setWatchedAt(id, watchedAt) {
      await persistUpdate(id, (entry) => ({ ...entry, watchedAt }));
    },

    async setRewatchCount(id, count) {
      await persistUpdate(id, (entry) => ({ ...entry, rewatchCount: clampRewatchCount(count) }));
    },

    async setCurrentSeason(id, season) {
      await persistUpdate(id, (entry) => {
        if (!entry.tv) return entry;
        // Marking a current season implies the user is watching the show.
        const status = entry.status === 'want' && season !== null ? 'watching' : entry.status;
        return { ...entry, status, tv: { ...entry.tv, currentSeason: season } };
      });
    },

    async toggleSeasonCompleted(id, season) {
      await persistUpdate(id, (entry) => {
        if (!entry.tv) return entry;
        const set = new Set(entry.tv.completedSeasons);
        if (set.has(season)) set.delete(season);
        else set.add(season);
        const completedSeasons = [...set].sort((a, b) => a - b);
        return { ...entry, tv: { ...entry.tv, completedSeasons } };
      });
    },

    async setShowCompleted(id, completed) {
      const updated = await persistUpdate(id, (entry) => {
        if (!entry.tv) return entry;
        const next = { ...entry, tv: { ...entry.tv, isShowCompleted: completed } };
        if (completed) {
          next.status = 'completed';
          if (entry.watchedAt === null) next.watchedAt = todayDate();
        }
        return next;
      });
      // One completion-oriented entry for the show; nothing logged when un-completing.
      if (updated && completed && updated.tv) {
        logActivity('completed_show', `Completed ${updated.snapshot.title}`, id);
      }
    },

    async toggleEntryCollection(entryId, collectionId) {
      await persistUpdate(entryId, (entry) => {
        const has = entry.collectionIds.includes(collectionId);
        return {
          ...entry,
          collectionIds: has
            ? entry.collectionIds.filter((c) => c !== collectionId)
            : [...entry.collectionIds, collectionId],
        };
      });
    },

    // Remove a (deleted) collection's id from every entry that references it.
    async detachCollection(collectionId) {
      const previous = get().entries;
      const changed = Object.values(previous)
        .filter((entry) => entry.collectionIds.includes(collectionId))
        .map((entry) =>
          touchEntry({
            ...entry,
            collectionIds: entry.collectionIds.filter((c) => c !== collectionId),
          }),
        );
      if (changed.length === 0) return;

      const next = { ...previous };
      for (const entry of changed) next[entry.id] = entry;
      set({ entries: next });
      try {
        for (const entry of changed) await getRepository().upsertEntry(entry);
      } catch (err) {
        set({ entries: previous, error: 'Could not update collections. Please try again.' });
        throw err;
      }
    },

    async toggleEntryTag(entryId, tagId) {
      await persistUpdate(entryId, (entry) => {
        const has = entry.tagIds.includes(tagId);
        return {
          ...entry,
          tagIds: has ? entry.tagIds.filter((t) => t !== tagId) : [...entry.tagIds, tagId],
        };
      });
    },

    // Remove a (deleted) tag's id from every entry that references it.
    async detachTag(tagId) {
      const previous = get().entries;
      const changed = Object.values(previous)
        .filter((entry) => entry.tagIds.includes(tagId))
        .map((entry) => touchEntry({ ...entry, tagIds: entry.tagIds.filter((t) => t !== tagId) }));
      if (changed.length === 0) return;

      const next = { ...previous };
      for (const entry of changed) next[entry.id] = entry;
      set({ entries: next });
      try {
        for (const entry of changed) await getRepository().upsertEntry(entry);
      } catch (err) {
        set({ entries: previous, error: 'Could not update tags. Please try again.' });
        throw err;
      }
    },
  };
});

/** Selector hook: the library entry for a given TMDB title, or undefined if untracked. */
export function useTrackedEntry(mediaType: MediaType, tmdbId: number): LibraryEntry | undefined {
  return useLibraryStore((s) =>
    Object.values(s.entries).find(
      (entry) => entry.mediaType === mediaType && entry.tmdbId === tmdbId,
    ),
  );
}
