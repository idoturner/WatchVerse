import type { z } from 'zod';
import { STORAGE_KEY_VERSION, STORAGE_NAMESPACE } from '@/config/constants';
import type { KeyValueStore } from './keyValueStore';

/**
 * Validated, namespaced access over a KeyValueStore. Every read is parsed and
 * Zod-validated; invalid data is quarantined (preserved, never overwritten) and a
 * safe fallback is returned, so corruption never crashes the app or destroys good
 * data (docs/03-architecture/state-and-persistence.md §5.3).
 */
export class StorageAdapter {
  constructor(private readonly store: KeyValueStore) {}

  private fullKey(name: string): string {
    return `${STORAGE_NAMESPACE}:${STORAGE_KEY_VERSION}:${name}`;
  }

  // Input is `unknown` because we parse arbitrary stored JSON; this also lets schemas
  // whose parsed output differs from their input (e.g. `.catch`/`.default` fields) be used.
  read<T>(name: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>, fallback: T): T {
    const raw = this.store.get(this.fullKey(name));
    if (raw === null) return fallback;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.quarantine(name, raw);
      return fallback;
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      this.quarantine(name, raw);
      return fallback;
    }
    return result.data;
  }

  write<T>(name: string, value: T): void {
    this.store.set(this.fullKey(name), JSON.stringify(value));
  }

  remove(name: string): void {
    this.store.remove(this.fullKey(name));
  }

  private quarantine(name: string, raw: string): void {
    const quarantineKey = `${this.fullKey(name)}:corrupt:${Date.now()}`;
    try {
      this.store.set(quarantineKey, raw);
    } catch {
      // If even quarantine fails (e.g. quota), we still must not crash.
    }
    console.warn(
      `[WatchVerse] Invalid stored data for "${name}" was quarantined at "${quarantineKey}".`,
    );
  }
}
