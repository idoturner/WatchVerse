import type { ReactNode } from 'react';
import type { LibraryEntry } from '@/domain/types';
import { Card } from '@/shared/ui';
import { useLibraryStore } from '@/stores/libraryStore';
import { RatingControl } from './RatingControl';
import { ReviewControl } from './ReviewControl';
import { RewatchControl } from './RewatchControl';
import { WatchDateControl } from './WatchDateControl';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-text-secondary">{label}</h3>
      {children}
    </div>
  );
}

/** The personal tracking surface for a title already in the library. */
export function TrackingPanel({ entry }: { entry: LibraryEntry }) {
  const setRating = useLibraryStore((s) => s.setRating);
  const setReview = useLibraryStore((s) => s.setReview);
  const setWatchedAt = useLibraryStore((s) => s.setWatchedAt);
  const setRewatchCount = useLibraryStore((s) => s.setRewatchCount);

  return (
    <Card className="p-4">
      <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">Your tracking</h2>
      <div className="space-y-5">
        <Field label="Your rating">
          <RatingControl
            value={entry.rating}
            titleLabel={entry.snapshot.title}
            onChange={(value) => void setRating(entry.id, value)}
          />
        </Field>

        <Field label="Your review">
          {/* key resets local draft when switching between titles */}
          <ReviewControl
            key={entry.id}
            value={entry.review}
            onChange={(value) => void setReview(entry.id, value)}
          />
        </Field>

        <div className="flex flex-wrap gap-8">
          <Field label="Watch date">
            <WatchDateControl
              value={entry.watchedAt}
              onChange={(value) => void setWatchedAt(entry.id, value)}
            />
          </Field>
          <Field label="Times rewatched">
            <RewatchControl
              value={entry.rewatchCount}
              onChange={(value) => void setRewatchCount(entry.id, value)}
            />
          </Field>
        </div>
      </div>
    </Card>
  );
}
