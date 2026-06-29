import { useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { routes } from '@/config/routes';
import { useAchievementWatcher } from '@/features/achievements';
import { CommandPalette } from '@/features/command-palette';
import { SearchField } from '@/features/discover';
import { OnboardingDialog } from '@/features/onboarding';
import { cn } from '@/shared/lib/cn';
import { useMotionPreference } from '@/shared/hooks/useMotionPreference';
import { useAchievementsStore } from '@/stores/achievementsStore';
import { useActivityStore } from '@/stores/activityStore';
import { useCollectionsStore } from '@/stores/collectionsStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTagsStore } from '@/stores/tagsStore';
import { MobileNav, type NavItem } from './MobileNav';

/** Primary navigation, shared by the desktop bar and the mobile menu. */
const NAV_ITEMS: NavItem[] = [
  { to: routes.home, label: 'Home', end: true },
  { to: routes.dashboard, label: 'Dashboard', end: false },
  { to: routes.discover, label: 'Discover', end: false },
  { to: routes.library, label: 'Library', end: false },
  { to: routes.collections, label: 'Collections', end: false },
  { to: routes.cinema, label: 'Cinema', end: false },
  { to: routes.settings, label: 'Settings', end: false },
];

/** App shell: brand, global search, content outlet, and TMDB attribution. */
export function AppLayout() {
  const hydrateLibrary = useLibraryStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateSearchHistory = useSearchHistoryStore((s) => s.hydrate);
  const hydrateCollections = useCollectionsStore((s) => s.hydrate);
  const hydrateTags = useTagsStore((s) => s.hydrate);
  const hydrateProfile = useProfileStore((s) => s.hydrate);
  const hydrateAchievements = useAchievementsStore((s) => s.hydrate);
  const hydrateActivity = useActivityStore((s) => s.hydrate);

  useEffect(() => {
    void hydrateLibrary();
    void hydrateSettings();
    void hydrateSearchHistory();
    void hydrateCollections();
    void hydrateTags();
    void hydrateProfile();
    void hydrateAchievements();
    void hydrateActivity();
  }, [
    hydrateLibrary,
    hydrateSettings,
    hydrateSearchHistory,
    hydrateCollections,
    hydrateTags,
    hydrateProfile,
    hydrateAchievements,
    hydrateActivity,
  ]);

  // Deterministically unlock achievements as local data changes.
  useAchievementWatcher();

  // Apply the user's reduced-motion preference (overrides the OS setting either way).
  const reducedMotion = useSettingsStore((s) => s.settings.reducedMotion);
  useMotionPreference(reducedMotion);
  // Mirror the preference to Framer Motion (covers JS-driven animations like Cinema Mode).
  const motionMode = reducedMotion === 'on' ? 'always' : reducedMotion === 'off' ? 'never' : 'user';

  return (
    <MotionConfig reducedMotion={motionMode}>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-[100] border-b border-border-subtle bg-bg-base">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            <Link
              to={routes.home}
              className="shrink-0 font-display text-lg font-bold text-text-primary"
            >
              Watch<span className="text-accent">Verse</span>
            </Link>

            <nav aria-label="Main" className="hidden gap-1 sm:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium',
                      isActive
                        ? 'bg-bg-surface text-text-primary'
                        : 'text-text-secondary hover:text-text-primary',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto w-full max-w-sm">
              <SearchField />
            </div>

            <MobileNav items={NAV_ITEMS} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          <Outlet />
        </main>

        <footer className="border-t border-border-subtle px-4 py-6 text-center text-xs text-text-tertiary">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </footer>

        <OnboardingDialog />
        <CommandPalette />
      </div>
    </MotionConfig>
  );
}
