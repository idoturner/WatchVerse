import { describe, expect, it } from 'vitest';
import { runMigrations, type Migration } from './migrations';
import { StorageAdapter } from './storage';
import { createMemoryStore } from './keyValueStore';

function adapter() {
  return new StorageAdapter(createMemoryStore());
}

describe('runMigrations', () => {
  it('applies migrations in order up to the target version', () => {
    const calls: number[] = [];
    const list: Migration[] = [
      { to: 3, run: () => calls.push(3) },
      { to: 2, run: () => calls.push(2) },
    ];
    const result = runMigrations(adapter(), 1, list, 3);
    expect(calls).toEqual([2, 3]);
    expect(result).toBe(3);
  });

  it('skips migrations at or below the current version', () => {
    const calls: number[] = [];
    const list: Migration[] = [{ to: 2, run: () => calls.push(2) }];
    const result = runMigrations(adapter(), 2, list, 2);
    expect(calls).toEqual([]);
    expect(result).toBe(2);
  });

  it('does not apply migrations beyond the target version', () => {
    const calls: number[] = [];
    const list: Migration[] = [
      { to: 2, run: () => calls.push(2) },
      { to: 3, run: () => calls.push(3) },
    ];
    const result = runMigrations(adapter(), 1, list, 2);
    expect(calls).toEqual([2]);
    expect(result).toBe(2);
  });
});
