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

export type ImportMode = 'merge' | 'replace';

/**
 * The single persistence boundary for all user data. The entire app depends on
 * this interface — never a concrete implementation. All methods are asynchronous
 * by design so the storage engine (LocalStorage → IndexedDB → backend) can change
 * without touching consumers (ADR-001).
 */
export interface LibraryRepository {
  // Library entries
  getEntries(): Promise<LibraryEntry[]>;
  upsertEntry(entry: LibraryEntry): Promise<void>;
  removeEntry(id: string): Promise<void>;

  // Collections
  getCollections(): Promise<Collection[]>;
  upsertCollection(collection: Collection): Promise<void>;
  removeCollection(id: string): Promise<void>;

  // Tags
  getTags(): Promise<Tag[]>;
  upsertTag(tag: Tag): Promise<void>;
  removeTag(id: string): Promise<void>;

  // Profile & settings
  getProfile(): Promise<Profile>;
  saveProfile(profile: Profile): Promise<void>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  // Activity & achievements
  getActivity(): Promise<Activity[]>;
  appendActivity(activity: Activity): Promise<void>;
  saveActivity(items: Activity[]): Promise<void>;
  getAchievements(): Promise<AchievementRecord[]>;
  upsertAchievement(record: AchievementRecord): Promise<void>;

  // Search history
  getSearchHistory(): Promise<SearchHistoryItem[]>;
  saveSearchHistory(items: SearchHistoryItem[]): Promise<void>;

  // Bulk operations
  exportAll(): Promise<WatchVerseExport>;
  importAll(data: WatchVerseExport, mode: ImportMode): Promise<void>;
  clearAll(): Promise<void>;
}
