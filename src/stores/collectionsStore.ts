import { create } from 'zustand';
import { getRepository } from '@/data/repository/activeRepository';
import { createCollection } from '@/domain/collections';
import type { Collection } from '@/domain/types';
import { useActivityStore } from './activityStore';
import { useLibraryStore } from './libraryStore';

interface CollectionsState {
  items: Record<string, Collection>;
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  create: (name: string) => Promise<Collection | null>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/** Client-state store for user collections, persisted via the async Repository. */
export const useCollectionsStore = create<CollectionsState>((set, get) => ({
  items: {},
  hydrated: false,
  error: null,

  async hydrate() {
    try {
      const list = await getRepository().getCollections();
      set({ items: Object.fromEntries(list.map((c) => [c.id, c])), hydrated: true, error: null });
    } catch {
      set({ hydrated: true, error: 'Could not load your collections.' });
    }
  },

  async create(name) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const collection = createCollection(trimmed);
    const previous = get().items;
    set({ items: { ...previous, [collection.id]: collection } });
    try {
      await getRepository().upsertCollection(collection);
    } catch (err) {
      set({ items: previous, error: 'Could not create the collection. Please try again.' });
      throw err;
    }
    void useActivityStore.getState().log({
      type: 'collection_created',
      label: `Created collection “${collection.name}”`,
      refId: collection.id,
    });
    return collection;
  },

  async rename(id, name) {
    const trimmed = name.trim();
    const previous = get().items;
    const current = previous[id];
    if (!current || !trimmed) return;
    const updated: Collection = { ...current, name: trimmed, updatedAt: new Date().toISOString() };
    set({ items: { ...previous, [id]: updated } });
    try {
      await getRepository().upsertCollection(updated);
    } catch (err) {
      set({ items: previous, error: 'Could not rename the collection. Please try again.' });
      throw err;
    }
  },

  async remove(id) {
    const previous = get().items;
    const next = { ...previous };
    delete next[id];
    set({ items: next });
    try {
      await getRepository().removeCollection(id);
      // Keep entries consistent: drop the deleted collection from their references.
      await useLibraryStore.getState().detachCollection(id);
    } catch (err) {
      set({ items: previous, error: 'Could not delete the collection. Please try again.' });
      throw err;
    }
  },
}));
