import { formatDistanceToNow } from 'date-fns';
import { useActivityStore } from '@/stores/activityStore';

interface ActivityTimelineProps {
  limit?: number;
}

/** A compact, human-readable timeline of recent local events. */
export function ActivityTimeline({ limit = 15 }: ActivityTimelineProps) {
  const items = useActivityStore((s) => s.items).slice(0, limit);

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">
        No activity yet — start tracking to build your history here.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 text-text-primary">{item.label}</span>
          <time className="shrink-0 text-xs text-text-tertiary" dateTime={item.createdAt}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </time>
        </li>
      ))}
    </ol>
  );
}
