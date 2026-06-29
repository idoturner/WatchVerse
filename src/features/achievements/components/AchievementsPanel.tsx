import { Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '@/domain/achievements';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { ACHIEVEMENT_ICONS } from './icons';

/** The full catalog with unlocked state. Locked entries stay visible to invite progress. */
export function AchievementsPanel() {
  const unlocked = useAchievementsStore((s) => s.unlocked);
  const unlockedCount = Object.keys(unlocked).length;

  return (
    <section aria-label="Achievements">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-text-primary">Achievements</h2>
        <span className="text-sm text-text-tertiary">
          {unlockedCount}/{ACHIEVEMENTS.length}
        </span>
      </div>

      {unlockedCount === 0 ? (
        <p className="mb-3 text-sm text-text-tertiary">
          Track titles, write reviews, and organize your library to start unlocking achievements.
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlocked[achievement.id] !== undefined;
          const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Trophy;
          return (
            <li key={achievement.id}>
              <Card
                className={cn('flex h-full items-start gap-3 p-3', !isUnlocked && 'opacity-50')}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 shrink-0',
                    isUnlocked ? 'text-highlight' : 'text-text-tertiary',
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{achievement.title}</p>
                  <p className="text-xs text-text-secondary">{achievement.description}</p>
                  <span className="sr-only">{isUnlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
