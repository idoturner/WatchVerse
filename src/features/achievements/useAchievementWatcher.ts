import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { buildAchievementContext, type AchievementDef } from '@/domain/achievements';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { useActivityStore } from '@/stores/activityStore';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { useTagsStore } from '@/stores/tagsStore';

function celebrate(achievement: AchievementDef): void {
  // A toast is a low-noise, accessible (aria-live) celebration; motion is governed by the
  // app's global reduced-motion CSS, so it stays calm when the user prefers reduced motion.
  toast(`Achievement unlocked: ${achievement.title}`, {
    description: achievement.description,
    duration: 5000,
  });
}

/**
 * Watches local data and unlocks achievements deterministically. Pre-existing unlocks are
 * reconciled silently on first run so an imported library doesn't fire a burst of toasts;
 * only genuinely new unlocks afterwards celebrate and append an activity entry.
 */
export function useAchievementWatcher(): void {
  const entries = useLibraryStore((s) => s.entries);
  const libraryHydrated = useLibraryStore((s) => s.hydrated);
  const collections = useCollectionsStore((s) => s.items);
  const tags = useTagsStore((s) => s.items);
  const achievementsHydrated = useAchievementsStore((s) => s.hydrated);
  const evaluate = useAchievementsStore((s) => s.evaluate);

  const reconciled = useRef(false);

  useEffect(() => {
    if (!libraryHydrated || !achievementsHydrated) return;
    const ctx = buildAchievementContext(
      Object.values(entries),
      Object.keys(collections).length,
      Object.keys(tags).length,
    );

    let cancelled = false;
    void (async () => {
      const newly = await evaluate(ctx);
      if (cancelled) return;
      if (!reconciled.current) {
        reconciled.current = true; // first pass only reconciles existing data — no celebration
        return;
      }
      for (const achievement of newly) {
        celebrate(achievement);
        void useActivityStore.getState().log({
          type: 'achievement_unlocked',
          label: `Unlocked: ${achievement.title}`,
          refId: achievement.id,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entries, collections, tags, libraryHydrated, achievementsHydrated, evaluate]);
}
