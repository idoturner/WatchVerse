import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { ACTIVITY_CAP } from '@/config/constants';
import { getRepository } from '@/data/repository/activeRepository';
import type { Activity, ActivityType } from '@/domain/types';

interface LogInput {
  type: ActivityType;
  label: string;
  refId?: string | null;
}

interface ActivityState {
  items: Activity[]; // newest first
  hydrated: boolean;
  hydrate: () => Promise<void>;
  log: (input: LogInput) => Promise<void>;
}

/** Local, capped activity history. Collapses consecutive same-event repeats to avoid spam. */
export const useActivityStore = create<ActivityState>((set, get) => ({
  items: [],
  hydrated: false,

  async hydrate() {
    try {
      const items = await getRepository().getActivity();
      set({ items, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  async log(input) {
    const activity: Activity = {
      id: nanoid(),
      type: input.type,
      label: input.label,
      refId: input.refId ?? null,
      createdAt: new Date().toISOString(),
    };
    const items = get().items;
    const head = items[0];
    // Collapse rapid repeats of the same event on the same target (e.g. rating drags).
    const collapse =
      head !== undefined && head.type === activity.type && head.refId === activity.refId;
    const next = (collapse ? [activity, ...items.slice(1)] : [activity, ...items]).slice(
      0,
      ACTIVITY_CAP,
    );
    set({ items: next });
    try {
      await getRepository().saveActivity(next);
    } catch {
      // best-effort persistence
    }
  },
}));
