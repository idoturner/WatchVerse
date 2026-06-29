import { create } from 'zustand';
import { getRepository } from '@/data/repository/activeRepository';
import { defaultSettings } from '@/domain/defaults';
import type { Settings } from '@/domain/types';

interface SettingsState {
  settings: Settings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<Omit<Settings, 'updatedAt'>>) => Promise<void>;
}

/** Device-preferences store, persisted separately from library content. */
export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings(),
  hydrated: false,

  async hydrate() {
    try {
      const settings = await getRepository().getSettings();
      set({ settings, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  async update(patch) {
    const next: Settings = { ...get().settings, ...patch, updatedAt: new Date().toISOString() };
    set({ settings: next });
    await getRepository().saveSettings(next);
  },
}));
