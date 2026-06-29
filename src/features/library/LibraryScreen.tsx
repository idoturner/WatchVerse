import { useState } from 'react';
import { LayoutGrid, Library as LibraryIcon, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '@/config/routes';
import { STATUS_LABELS, STATUS_ORDER } from '@/domain/status';
import type { SortKey } from '@/domain/types';
import { cn } from '@/shared/lib/cn';
import { TagManagerDialog } from '@/features/tags';
import { Button, EmptyState, Select } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { useTagsStore } from '@/stores/tagsStore';
import { ImportExportControls } from './components/ImportExportControls';
import { LibraryCard } from './components/LibraryCard';
import { LibraryRow } from './components/LibraryRow';
import {
  filterEntriesByStatus,
  filterEntriesByTag,
  sortEntries,
  type StatusFilter,
} from './librarySort';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date_added', label: 'Date added' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
];

export function LibraryScreen() {
  const entries = useLibraryStore((s) => Object.values(s.entries));
  const tags = useTagsStore((s) => Object.values(s.items));
  const [status, setStatus] = useState<StatusFilter>('all');
  const [tag, setTag] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('date_added');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const visible = sortEntries(
    filterEntriesByTag(filterEntriesByStatus(entries, status), tag),
    sort,
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-text-primary">Your Library</h1>
        <div className="flex flex-wrap gap-2">
          <TagManagerDialog />
          <ImportExportControls />
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>

          {tags.length > 0 ? (
            <Select aria-label="Filter by tag" value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="all">All tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          ) : null}

          <Select
            aria-label="Sort by"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="ml-auto inline-flex overflow-hidden rounded-md border border-border-strong">
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
              className={cn(
                'grid h-9 w-9 place-items-center',
                view === 'grid'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-bg-surface',
              )}
            >
              <LayoutGrid aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
              className={cn(
                'grid h-9 w-9 place-items-center',
                view === 'list'
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-bg-surface',
              )}
            >
              <List aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <EmptyState
          icon={<LibraryIcon className="h-10 w-10" aria-hidden="true" />}
          title="Your library is empty"
          description="Find a movie or show and add it to start tracking what you watch."
          action={
            <Button asChild>
              <Link to={routes.home}>Discover titles</Link>
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<LibraryIcon className="h-10 w-10" aria-hidden="true" />}
          title="No titles match these filters"
          description="Try a different status or tag filter."
        />
      ) : view === 'list' ? (
        <ul className="flex flex-col gap-2">
          {visible.map((entry) => (
            <li
              key={entry.id}
              className="[contain-intrinsic-size:0_72px] [content-visibility:auto]"
            >
              <LibraryRow entry={entry} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
          {visible.map((entry) => (
            <li
              key={entry.id}
              className="[contain-intrinsic-size:0_280px] [content-visibility:auto]"
            >
              <LibraryCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
