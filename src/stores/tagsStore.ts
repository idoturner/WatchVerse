import { create } from 'zustand';
import { getRepository } from '@/data/repository/activeRepository';
import { createTag } from '@/domain/tags';
import type { Tag } from '@/domain/types';
import { useLibraryStore } from './libraryStore';

interface TagsState {
  items: Record<string, Tag>;
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  create: (name: string) => Promise<Tag | null>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/** Client-state store for user tags (lightweight labels), via the async Repository. */
export const useTagsStore = create<TagsState>((set, get) => ({
  items: {},
  hydrated: false,
  error: null,

  async hydrate() {
    try {
      const list = await getRepository().getTags();
      set({ items: Object.fromEntries(list.map((t) => [t.id, t])), hydrated: true, error: null });
    } catch {
      set({ hydrated: true, error: 'Could not load your tags.' });
    }
  },

  async create(name) {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const tag = createTag(trimmed);
    const previous = get().items;
    set({ items: { ...previous, [tag.id]: tag } });
    try {
      await getRepository().upsertTag(tag);
    } catch (err) {
      set({ items: previous, error: 'Could not create the tag. Please try again.' });
      throw err;
    }
    return tag;
  },

  async rename(id, name) {
    const trimmed = name.trim();
    const previous = get().items;
    const current = previous[id];
    if (!current || !trimmed || trimmed === current.name) return;
    const updated: Tag = { ...current, name: trimmed, updatedAt: new Date().toISOString() };
    set({ items: { ...previous, [id]: updated } });
    try {
      await getRepository().upsertTag(updated);
    } catch (err) {
      set({ items: previous, error: 'Could not rename the tag. Please try again.' });
      throw err;
    }
  },

  async remove(id) {
    const previous = get().items;
    const next = { ...previous };
    delete next[id];
    set({ items: next });
    try {
      await getRepository().removeTag(id);
      await useLibraryStore.getState().detachTag(id);
    } catch (err) {
      set({ items: previous, error: 'Could not delete the tag. Please try again.' });
      throw err;
    }
  },
}));
