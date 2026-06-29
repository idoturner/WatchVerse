import { beforeEach, describe, expect, it } from 'vitest';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { defaultProfile } from '@/domain/defaults';
import { useProfileStore } from './profileStore';

const ps = () => useProfileStore.getState();

describe('profileStore', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useProfileStore.setState({ profile: defaultProfile(), hydrated: true });
  });

  it('sets and persists the display name', async () => {
    await ps().setName('Sam');
    expect(ps().profile.displayName).toBe('Sam');
    useProfileStore.setState({ profile: defaultProfile(), hydrated: false });
    await ps().hydrate();
    expect(ps().profile.displayName).toBe('Sam');
  });

  it('ignores an empty name', async () => {
    await ps().setName('   ');
    expect(ps().profile.displayName).toBe('You');
  });
});
