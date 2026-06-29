/**
 * Minimal key/value store abstraction. The LocalStorage implementation backs v1.0;
 * an in-memory implementation backs tests, and (later) an IndexedDB-backed store can
 * drop in here without touching the Repository — the storage-engine seam (ADR-001/003).
 */
export interface KeyValueStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  keys(): string[];
}

export const localStorageStore: KeyValueStore = {
  get: (key) => window.localStorage.getItem(key),
  set: (key, value) => window.localStorage.setItem(key, value),
  remove: (key) => window.localStorage.removeItem(key),
  keys: () => Object.keys(window.localStorage),
};

/** In-memory store for tests and ephemeral use. */
export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => {
      map.set(key, value);
    },
    remove: (key) => {
      map.delete(key);
    },
    keys: () => [...map.keys()],
  };
}
