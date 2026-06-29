import { create } from 'zustand';
import { getRepository } from '@/data/repository/activeRepository';
import {
  evaluateAchievements,
  type AchievementContext,
  type AchievementDef,
} from '@/domain/achievements';
import type { AchievementRecord } from '@/domain/types';

interface AchievementsState {
  unlocked: Record<string, AchievementRecord>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  /** Unlock any newly-earned achievements (idempotent); returns the new defs. */
  evaluate: (ctx: AchievementContext) => Promise<AchievementDef[]>;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  unlocked: {},
  hydrated: false,

  async hydrate() {
    try {
      const list = await getRepository().getAchievements();
      set({ unlocked: Object.fromEntries(list.map((r) => [r.achievementId, r])), hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  async evaluate(ctx) {
    const unlockedIds = new Set(Object.keys(get().unlocked));
    const newly = evaluateAchievements(ctx, unlockedIds);
    if (newly.length === 0) return [];

    const now = new Date().toISOString();
    const records: AchievementRecord[] = newly.map((a) => ({
      achievementId: a.id,
      unlockedAt: now,
    }));
    set({
      unlocked: {
        ...get().unlocked,
        ...Object.fromEntries(records.map((r) => [r.achievementId, r])),
      },
    });
    try {
      for (const record of records) await getRepository().upsertAchievement(record);
    } catch {
      // best-effort persistence; in-memory state already reflects the unlock
    }
    return newly;
  },
}));
