import { create } from 'zustand';
import { getRepository } from '@/data/repository/activeRepository';
import { defaultProfile } from '@/domain/defaults';
import type { Profile } from '@/domain/types';

interface ProfileState {
  profile: Profile;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setName: (name: string) => Promise<void>;
}

/** Local-first profile (display name only). No accounts/avatars/auth. */
export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: defaultProfile(),
  hydrated: false,

  async hydrate() {
    try {
      const profile = await getRepository().getProfile();
      set({ profile, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  async setName(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next: Profile = {
      ...get().profile,
      displayName: trimmed,
      updatedAt: new Date().toISOString(),
    };
    set({ profile: next });
    await getRepository().saveProfile(next);
  },
}));
