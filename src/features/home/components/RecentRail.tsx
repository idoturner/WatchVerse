import type { LibraryEntry } from '@/domain/types';
import { LibraryCard } from '@/features/library';

/** Horizontal rail of the most recently added local-library titles. */
export function RecentRail({ entries }: { entries: LibraryEntry[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-lg font-semibold text-text-primary">Recently added</h2>
      <ul className="flex gap-4 overflow-x-auto pb-2">
        {entries.map((entry) => (
          <li key={entry.id} className="w-36 shrink-0">
            <LibraryCard entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}
