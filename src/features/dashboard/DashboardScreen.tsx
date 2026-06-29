import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { routes } from '@/config/routes';
import { computeStats } from '@/domain/stats';
import type { LibraryEntry } from '@/domain/types';
import { AchievementsPanel } from '@/features/achievements';
import { ActivityTimeline } from '@/features/activity';
import { LibraryCard } from '@/features/library';
import { Button, Card, EmptyState } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { useProfileStore } from '@/stores/profileStore';
import { NameEditor } from './components/NameEditor';
import { RatingsChart } from './components/RatingsChart';
import { StatCard } from './components/StatCard';
import { StatusBreakdown } from './components/StatusBreakdown';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}

function TitleGrid({ entries }: { entries: LibraryEntry[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
      {entries.map((entry) => (
        <li key={entry.id}>
          <LibraryCard entry={entry} />
        </li>
      ))}
    </ul>
  );
}

export function DashboardScreen() {
  const entries = useLibraryStore((s) => Object.values(s.entries));
  const stats = useMemo(() => computeStats(entries), [entries]);
  const name = useProfileStore((s) => s.profile.displayName);
  const setName = useProfileStore((s) => s.setName);
  const ratedCount = stats.ratingsDistribution.reduce((sum, b) => sum + b.count, 0);

  if (entries.length === 0) {
    return (
      <div>
        <h1 className="mb-6 font-display text-2xl font-bold text-text-primary">Dashboard</h1>
        <EmptyState
          icon={<BarChart3 className="h-10 w-10" aria-hidden="true" />}
          title="Your dashboard is waiting"
          description="Track movies and shows — your stats, top titles, and habits will appear here."
          action={
            <Button asChild>
              <Link to={routes.discover}>Find something to watch</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="flex items-center gap-2 text-sm text-text-secondary">
          Profile: <NameEditor name={name} onSave={(n) => void setName(n)} />
        </p>
      </header>

      <section
        aria-label="Overview"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <StatCard label="Movies watched" value={stats.moviesWatched} />
        <StatCard label="Shows watched" value={stats.showsWatched} />
        <StatCard label="Completed" value={stats.totalCompleted} />
        <StatCard
          label="Watch hours"
          value={`≈ ${stats.estimatedWatchHours}`}
          hint="estimated, incl. rewatches"
        />
        <StatCard label="Completion" value={`${stats.completionPercentage}%`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Status breakdown">
          <Card className="p-4">
            <StatusBreakdown breakdown={stats.statusBreakdown} total={stats.totalTracked} />
          </Card>
        </Section>
        {stats.averageRating !== null ? (
          <Section title={`Your ratings · avg ${stats.averageRating}`}>
            <Card className="p-4">
              <RatingsChart distribution={stats.ratingsDistribution} count={ratedCount} />
            </Card>
          </Section>
        ) : null}
      </div>

      {stats.topMovies.length > 0 ? (
        <Section title="Top movies">
          <TitleGrid entries={stats.topMovies} />
        </Section>
      ) : null}
      {stats.topShows.length > 0 ? (
        <Section title="Top shows">
          <TitleGrid entries={stats.topShows} />
        </Section>
      ) : null}
      {stats.recentlyCompleted.length > 0 ? (
        <Section title="Recently completed">
          <TitleGrid entries={stats.recentlyCompleted} />
        </Section>
      ) : null}

      <AchievementsPanel />

      <Section title="Recent activity">
        <Card className="p-4">
          <ActivityTimeline />
        </Card>
      </Section>

      <section aria-label="Go to" className="flex flex-wrap gap-2">
        <Button asChild variant="secondary">
          <Link to={routes.library}>Your Library</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to={routes.collections}>Collections</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to={routes.discover}>Discover</Link>
        </Button>
        <Button asChild variant="gold">
          <Link to={routes.cinema}>Cinema Mode</Link>
        </Button>
      </section>
    </div>
  );
}
