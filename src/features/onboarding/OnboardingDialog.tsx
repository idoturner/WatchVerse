import { Compass, Library, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '@/config/routes';
import { Button, Modal } from '@/shared/ui';
import { useSettingsStore } from '@/stores/settingsStore';

const QUICK_LINKS = [
  {
    to: routes.discover,
    icon: Compass,
    label: 'Discover titles',
    hint: 'Search movies & TV from TMDB',
  },
  { to: routes.library, icon: Library, label: 'Your Library', hint: 'Track what you watch' },
  { to: routes.cinema, icon: Shuffle, label: 'Cinema Mode', hint: 'Let WatchVerse pick for you' },
] as const;

/**
 * First-run welcome. Short and skippable; explains the local-first promise and points to
 * the main entry routes. Completion persists through the settings/Repository boundary.
 */
export function OnboardingDialog() {
  const hydrated = useSettingsStore((s) => s.hydrated);
  const completed = useSettingsStore((s) => s.settings.onboardingCompleted);
  const update = useSettingsStore((s) => s.update);

  const complete = () => void update({ onboardingCompleted: true });

  return (
    <Modal
      open={hydrated && !completed}
      onOpenChange={(open) => {
        if (!open) complete();
      }}
      title="Welcome to WatchVerse"
      description="Your private journal for every movie and show you watch."
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Everything you track stays on <strong className="text-text-primary">this device</strong> —
          no account, no cloud, no tracking. Back up or move your data anytime with export and
          import.
        </p>
        <ul className="grid gap-2">
          {QUICK_LINKS.map(({ to, icon: Icon, label, hint }) => (
            <li key={to}>
              <Button asChild variant="secondary" className="h-auto w-full justify-start py-2.5">
                <Link to={to} onClick={complete}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="text-left">
                    <span className="block text-sm font-medium text-text-primary">{label}</span>
                    <span className="block text-xs text-text-tertiary">{hint}</span>
                  </span>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={complete}>
            Skip
          </Button>
          <Button onClick={complete}>Get started</Button>
        </div>
      </div>
    </Modal>
  );
}
