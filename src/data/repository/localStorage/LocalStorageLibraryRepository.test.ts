import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageLibraryRepository } from './LocalStorageLibraryRepository';
import { createMemoryStore } from './keyValueStore';
import { createLibraryEntry } from '@/domain/library';
import type { LibraryRepository } from '../LibraryRepository';

function makeRepo(): LibraryRepository {
  return createLocalStorageLibraryRepository(createMemoryStore());
}

function entry(title: string) {
  return createLibraryEntry({
    tmdbId: Math.floor(Math.random() * 100000),
    mediaType: 'movie',
    snapshot: { title, posterPath: null, releaseYear: 2020 },
  });
}

describe('LocalStorageLibraryRepository', () => {
  let repo: LibraryRepository;
  beforeEach(() => {
    repo = makeRepo();
  });

  it('persists and reads back entries', async () => {
    const e = entry('Dune');
    await repo.upsertEntry(e);
    const all = await repo.getEntries();
    expect(all).toHaveLength(1);
    expect(all[0]?.snapshot.title).toBe('Dune');
  });

  it('removes an entry', async () => {
    const e = entry('Heat');
    await repo.upsertEntry(e);
    await repo.removeEntry(e.id);
    expect(await repo.getEntries()).toHaveLength(0);
  });

  it('round-trips via export and replace-import on a fresh repo', async () => {
    await repo.upsertEntry(entry('Alien'));
    await repo.upsertEntry(entry('Arrival'));
    const exported = await repo.exportAll();

    const fresh = makeRepo();
    await fresh.importAll(exported, 'replace');
    expect(await fresh.getEntries()).toHaveLength(2);
  });

  it('merges imported data, keeping the most recently updated record', async () => {
    const base = entry('Tenet');
    await repo.upsertEntry(base);

    const newer = {
      ...base,
      snapshot: { ...base.snapshot, title: 'Tenet (Director)' },
      updatedAt: '2999-01-01T00:00:00.000Z',
    };
    const importPayload = await repo.exportAll();
    importPayload.data.entries = [newer];

    await repo.importAll(importPayload, 'merge');
    const all = await repo.getEntries();
    expect(all).toHaveLength(1);
    expect(all[0]?.snapshot.title).toBe('Tenet (Director)');
  });

  it('quarantines corrupt data and returns a safe fallback', async () => {
    const store = createMemoryStore();
    store.set('watchverse:v1:entries', '{ not valid json');
    const r = createLocalStorageLibraryRepository(store);
    expect(await r.getEntries()).toEqual([]);
    expect(store.keys().some((k) => k.includes(':corrupt:'))).toBe(true);
  });

  it('merge import keeps both current and imported entries', async () => {
    await repo.upsertEntry(entry('A'));
    const payload = await repo.exportAll();
    payload.data.entries = [entry('B')];
    await repo.importAll(payload, 'merge');
    const titles = (await repo.getEntries()).map((e) => e.snapshot.title).sort();
    expect(titles).toEqual(['A', 'B']);
  });

  it('replace import keeps only imported entries', async () => {
    await repo.upsertEntry(entry('A'));
    const payload = await repo.exportAll();
    payload.data.entries = [entry('B')];
    await repo.importAll(payload, 'replace');
    expect((await repo.getEntries()).map((e) => e.snapshot.title)).toEqual(['B']);
  });

  it('preserves achievements and activity across export and replace-import', async () => {
    await repo.upsertAchievement({
      achievementId: 'first-title',
      unlockedAt: '2026-01-01T00:00:00.000Z',
    });
    await repo.saveActivity([
      {
        id: 'a1',
        type: 'added',
        label: 'Added X',
        refId: 'e1',
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ]);

    const payload = await repo.exportAll();
    expect(payload.data.achievements.map((a) => a.achievementId)).toContain('first-title');
    expect(payload.data.activity.map((a) => a.label)).toContain('Added X');

    const fresh = makeRepo();
    await fresh.importAll(payload, 'replace');
    expect((await fresh.getAchievements()).map((a) => a.achievementId)).toContain('first-title');
    expect((await fresh.getActivity()).map((a) => a.label)).toContain('Added X');
  });

  it('unions achievements and activity on merge-import', async () => {
    await repo.upsertAchievement({
      achievementId: 'first-title',
      unlockedAt: '2026-01-01T00:00:00.000Z',
    });
    await repo.saveActivity([
      {
        id: 'local',
        type: 'added',
        label: 'Local',
        refId: null,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const payload = await repo.exportAll();
    payload.data.achievements = [
      { achievementId: 'first-completed', unlockedAt: '2026-02-01T00:00:00.000Z' },
    ];
    payload.data.activity = [
      {
        id: 'incoming',
        type: 'rated',
        label: 'Incoming',
        refId: null,
        createdAt: '2026-02-01T00:00:00.000Z',
      },
    ];

    await repo.importAll(payload, 'merge');
    expect((await repo.getAchievements()).map((a) => a.achievementId).sort()).toEqual([
      'first-completed',
      'first-title',
    ]);
    expect((await repo.getActivity()).map((a) => a.label).sort()).toEqual(['Incoming', 'Local']);
  });

  it('preserves collections, tags, and memberships across export/import', async () => {
    const now = new Date().toISOString();
    await repo.upsertCollection({ id: 'c1', name: 'Marvel', createdAt: now, updatedAt: now });
    await repo.upsertTag({ id: 't1', name: 'Fave', createdAt: now, updatedAt: now });
    const e = { ...entry('A'), collectionIds: ['c1'], tagIds: ['t1'] };
    await repo.upsertEntry(e);

    const payload = await repo.exportAll();
    const fresh = makeRepo();
    await fresh.importAll(payload, 'replace');

    expect((await fresh.getCollections()).map((c) => c.name)).toEqual(['Marvel']);
    expect((await fresh.getTags()).map((t) => t.name)).toEqual(['Fave']);
    const reloaded = (await fresh.getEntries())[0];
    expect(reloaded?.collectionIds).toEqual(['c1']);
    expect(reloaded?.tagIds).toEqual(['t1']);
  });
});
