import {
  ACTIVITY_CAP,
  APP_VERSION,
  CURRENT_SCHEMA_VERSION,
  SEARCH_HISTORY_CAP,
  STORAGE_KEYS,
} from '@/config/constants';
import { defaultProfile, defaultSettings } from '@/domain/defaults';
import {
  AchievementsRecordSchema,
  ActivityArraySchema,
  CollectionsRecordSchema,
  EntriesRecordSchema,
  MetaSchema,
  ProfileSchema,
  SearchHistoryArraySchema,
  SettingsSchema,
  TagsRecordSchema,
} from '@/domain/schemas';
import type {
  AchievementRecord,
  Activity,
  Collection,
  LibraryEntry,
  Profile,
  SearchHistoryItem,
  Settings,
  Tag,
  WatchVerseExport,
} from '@/domain/types';
import type { ImportMode, LibraryRepository } from '../LibraryRepository';
import { localStorageStore, type KeyValueStore } from './keyValueStore';
import { runMigrations } from './migrations';
import { StorageAdapter } from './storage';

function toMap<T>(items: T[], getId: (item: T) => string): Record<string, T> {
  return Object.fromEntries(items.map((item) => [getId(item), item]));
}

/** Merge two id-keyed arrays, keeping the record with the most recent timestamp. */
function mergeByIdNewer<T>(
  current: T[],
  incoming: T[],
  getId: (item: T) => string,
  getTime: (item: T) => string,
): T[] {
  const map = new Map<string, T>(current.map((item) => [getId(item), item]));
  for (const item of incoming) {
    const existing = map.get(getId(item));
    if (!existing || getTime(item) >= getTime(existing)) {
      map.set(getId(item), item);
    }
  }
  return [...map.values()];
}

function newer<T>(current: T, incoming: T, getTime: (item: T) => string): T {
  return getTime(incoming) >= getTime(current) ? incoming : current;
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

/**
 * LocalStorage-backed implementation of the async Repository. Reads are validated;
 * writes are atomic per namespace. Storage-engine details live only here.
 */
export class LocalStorageLibraryRepository implements LibraryRepository {
  constructor(private readonly adapter: StorageAdapter) {}

  // --- Library entries ---
  private readEntries(): Record<string, LibraryEntry> {
    return this.adapter.read(STORAGE_KEYS.entries, EntriesRecordSchema, {});
  }
  async getEntries(): Promise<LibraryEntry[]> {
    return Object.values(this.readEntries());
  }
  async upsertEntry(entry: LibraryEntry): Promise<void> {
    const map = this.readEntries();
    map[entry.id] = entry;
    this.adapter.write(STORAGE_KEYS.entries, map);
  }
  async removeEntry(id: string): Promise<void> {
    const map = this.readEntries();
    delete map[id];
    this.adapter.write(STORAGE_KEYS.entries, map);
  }

  // --- Collections ---
  private readCollections(): Record<string, Collection> {
    return this.adapter.read(STORAGE_KEYS.collections, CollectionsRecordSchema, {});
  }
  async getCollections(): Promise<Collection[]> {
    return Object.values(this.readCollections());
  }
  async upsertCollection(collection: Collection): Promise<void> {
    const map = this.readCollections();
    map[collection.id] = collection;
    this.adapter.write(STORAGE_KEYS.collections, map);
  }
  async removeCollection(id: string): Promise<void> {
    const map = this.readCollections();
    delete map[id];
    this.adapter.write(STORAGE_KEYS.collections, map);
  }

  // --- Tags ---
  private readTags(): Record<string, Tag> {
    return this.adapter.read(STORAGE_KEYS.tags, TagsRecordSchema, {});
  }
  async getTags(): Promise<Tag[]> {
    return Object.values(this.readTags());
  }
  async upsertTag(tag: Tag): Promise<void> {
    const map = this.readTags();
    map[tag.id] = tag;
    this.adapter.write(STORAGE_KEYS.tags, map);
  }
  async removeTag(id: string): Promise<void> {
    const map = this.readTags();
    delete map[id];
    this.adapter.write(STORAGE_KEYS.tags, map);
  }

  // --- Profile & settings ---
  async getProfile(): Promise<Profile> {
    return this.adapter.read(STORAGE_KEYS.profile, ProfileSchema, defaultProfile());
  }
  async saveProfile(profile: Profile): Promise<void> {
    this.adapter.write(STORAGE_KEYS.profile, profile);
  }
  async getSettings(): Promise<Settings> {
    return this.adapter.read(STORAGE_KEYS.settings, SettingsSchema, defaultSettings());
  }
  async saveSettings(settings: Settings): Promise<void> {
    this.adapter.write(STORAGE_KEYS.settings, settings);
  }

  // --- Activity & achievements ---
  async getActivity(): Promise<Activity[]> {
    return this.adapter.read(STORAGE_KEYS.activity, ActivityArraySchema, []);
  }
  async appendActivity(activity: Activity): Promise<void> {
    const list = await this.getActivity();
    this.adapter.write(STORAGE_KEYS.activity, [activity, ...list].slice(0, ACTIVITY_CAP));
  }
  async saveActivity(items: Activity[]): Promise<void> {
    this.adapter.write(STORAGE_KEYS.activity, items.slice(0, ACTIVITY_CAP));
  }
  async getAchievements(): Promise<AchievementRecord[]> {
    return Object.values(
      this.adapter.read(STORAGE_KEYS.achievements, AchievementsRecordSchema, {}),
    );
  }
  async upsertAchievement(record: AchievementRecord): Promise<void> {
    const map = this.adapter.read(STORAGE_KEYS.achievements, AchievementsRecordSchema, {});
    map[record.achievementId] = record;
    this.adapter.write(STORAGE_KEYS.achievements, map);
  }

  // --- Search history ---
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    return this.adapter.read(STORAGE_KEYS.searchHistory, SearchHistoryArraySchema, []);
  }
  async saveSearchHistory(items: SearchHistoryItem[]): Promise<void> {
    this.adapter.write(STORAGE_KEYS.searchHistory, items.slice(0, SEARCH_HISTORY_CAP));
  }

  // --- Bulk operations ---
  async exportAll(): Promise<WatchVerseExport> {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      data: {
        entries: await this.getEntries(),
        collections: await this.getCollections(),
        tags: await this.getTags(),
        profile: await this.getProfile(),
        settings: await this.getSettings(),
        activity: await this.getActivity(),
        achievements: await this.getAchievements(),
        searchHistory: await this.getSearchHistory(),
      },
    };
  }

  async importAll(data: WatchVerseExport, mode: ImportMode): Promise<void> {
    if (mode === 'replace') {
      this.writeAll(data);
      return;
    }
    // Merge: most-recently-updated record wins; achievements & history are unioned.
    const current = await this.exportAll();
    const merged: WatchVerseExport = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      data: {
        entries: mergeByIdNewer(
          current.data.entries,
          data.data.entries,
          (e) => e.id,
          (e) => e.updatedAt,
        ),
        collections: mergeByIdNewer(
          current.data.collections,
          data.data.collections,
          (c) => c.id,
          (c) => c.updatedAt,
        ),
        tags: mergeByIdNewer(
          current.data.tags,
          data.data.tags,
          (t) => t.id,
          (t) => t.updatedAt,
        ),
        achievements: mergeByIdNewer(
          current.data.achievements,
          data.data.achievements,
          (a) => a.achievementId,
          (a) => a.unlockedAt,
        ),
        profile: newer(current.data.profile, data.data.profile, (p) => p.updatedAt),
        settings: newer(current.data.settings, data.data.settings, (s) => s.updatedAt),
        activity: dedupeBy([...data.data.activity, ...current.data.activity], (a) => a.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, ACTIVITY_CAP),
        searchHistory: dedupeBy(
          [...data.data.searchHistory, ...current.data.searchHistory],
          (s) => s.query,
        ).slice(0, SEARCH_HISTORY_CAP),
      },
    };
    this.writeAll(merged);
  }

  async clearAll(): Promise<void> {
    for (const name of Object.values(STORAGE_KEYS)) {
      this.adapter.remove(name);
    }
    this.adapter.write(STORAGE_KEYS.meta, {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lastBackupAt: null,
    });
  }

  private writeAll(data: WatchVerseExport): void {
    this.adapter.write(
      STORAGE_KEYS.entries,
      toMap(data.data.entries, (e) => e.id),
    );
    this.adapter.write(
      STORAGE_KEYS.collections,
      toMap(data.data.collections, (c) => c.id),
    );
    this.adapter.write(
      STORAGE_KEYS.tags,
      toMap(data.data.tags, (t) => t.id),
    );
    this.adapter.write(
      STORAGE_KEYS.achievements,
      toMap(data.data.achievements, (a) => a.achievementId),
    );
    this.adapter.write(STORAGE_KEYS.profile, data.data.profile);
    this.adapter.write(STORAGE_KEYS.settings, data.data.settings);
    this.adapter.write(STORAGE_KEYS.activity, data.data.activity.slice(0, ACTIVITY_CAP));
    this.adapter.write(
      STORAGE_KEYS.searchHistory,
      data.data.searchHistory.slice(0, SEARCH_HISTORY_CAP),
    );
    this.adapter.write(STORAGE_KEYS.meta, {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      lastBackupAt: null,
    });
  }
}

/**
 * Factory: build a LocalStorage-backed Repository, running schema migrations and
 * ensuring the meta record. Accepts a custom store (tests inject an in-memory one).
 */
export function createLocalStorageLibraryRepository(
  store: KeyValueStore = localStorageStore,
): LibraryRepository {
  const adapter = new StorageAdapter(store);
  // A missing meta record is treated as "current" (a fresh install), so no spurious
  // migration runs; an older recorded version triggers migrations.
  const meta = adapter.read(STORAGE_KEYS.meta, MetaSchema, {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lastBackupAt: null,
  });
  const resultVersion = runMigrations(adapter, meta.schemaVersion);
  adapter.write(STORAGE_KEYS.meta, {
    schemaVersion: Math.max(resultVersion, CURRENT_SCHEMA_VERSION),
    lastBackupAt: meta.lastBackupAt,
  });
  return new LocalStorageLibraryRepository(adapter);
}
