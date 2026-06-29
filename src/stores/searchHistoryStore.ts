import { create } from 'zustand';
import { SEARCH_HISTORY_CAP } from '@/config/constants';
import { getRepository } from '@/data/repository/activeRepository';
import type { SearchHistoryItem } from '@/domain/types';

interface SearchHistoryState {
  items: SearchHistoryItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (query: string) => Promise<void>;
  remove: (query: string) => Promise<void>;
  clear: () => Promise<void>;
}

/** Local-only recent searches, persisted via the async Repository (capped). */
export const useSearchHistoryStore = create<SearchHistoryState>((set, get) => ({
  items: [],
  hydrated: false,

  async hydrate() {
    try {
      const items = await getRepository().getSearchHistory();
      set({ items, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  async add(query) {
    const trimmed = query.trim();
    if (!trimmed) return;
    const withoutDuplicate = get().items.filter(
      (item) => item.query.toLowerCase() !== trimmed.toLowerCase(),
    );
    const next = [
      { query: trimmed, createdAt: new Date().toISOString() },
      ...withoutDuplicate,
    ].slice(0, SEARCH_HISTORY_CAP);
    set({ items: next });
    await getRepository().saveSearchHistory(next);
  },

  async remove(query) {
    const next = get().items.filter((item) => item.query !== query);
    set({ items: next });
    await getRepository().saveSearchHistory(next);
  },

  async clear() {
    set({ items: [] });
    await getRepository().saveSearchHistory([]);
  },
}));
