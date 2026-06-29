import { CURRENT_SCHEMA_VERSION } from '@/config/constants';
import type { StorageAdapter } from './storage';

/**
 * A single schema migration. `to` is the schema version this migration produces;
 * `run` transforms persisted data in place via the adapter.
 */
export interface Migration {
  readonly to: number;
  run(adapter: StorageAdapter): void;
}

/**
 * Ordered list of schema migrations. Empty at v1.0 — future field/shape changes
 * append a migration here (ordered by `to`) so existing data is never lost.
 */
export const migrations: Migration[] = [];

/**
 * Apply migrations to move stored data from `fromVersion` up to `targetVersion`.
 * Pure over the injected adapter + migration list, so it is fully unit-testable.
 * Returns the resulting schema version.
 */
export function runMigrations(
  adapter: StorageAdapter,
  fromVersion: number,
  list: Migration[] = migrations,
  targetVersion: number = CURRENT_SCHEMA_VERSION,
): number {
  let version = fromVersion;
  const ordered = [...list].sort((a, b) => a.to - b.to);
  for (const migration of ordered) {
    if (migration.to > version && migration.to <= targetVersion) {
      migration.run(adapter);
      version = migration.to;
    }
  }
  return version;
}
