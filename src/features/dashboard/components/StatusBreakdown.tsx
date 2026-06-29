import { STATUS_LABELS, STATUS_ORDER } from '@/domain/status';
import type { WatchStatus } from '@/domain/types';
import { cn } from '@/shared/lib/cn';

const STATUS_BAR: Record<WatchStatus, string> = {
  want: 'bg-status-want',
  watching: 'bg-status-watching',
  completed: 'bg-status-completed',
  on_hold: 'bg-status-onhold',
  dropped: 'bg-status-dropped',
};

/** Accessible status breakdown: label + count + a proportional bar (not color-only). */
export function StatusBreakdown({
  breakdown,
  total,
}: {
  breakdown: Record<WatchStatus, number>;
  total: number;
}) {
  return (
    <ul className="space-y-3">
      {STATUS_ORDER.map((status) => {
        const count = breakdown[status];
        const pct = total === 0 ? 0 : Math.round((count / total) * 100);
        return (
          <li key={status}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{STATUS_LABELS[status]}</span>
              <span className="tabular-nums text-text-primary">{count}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-elevated">
              {/* width is an inherently dynamic value (a percentage) */}
              <div
                className={cn('h-2 rounded-full', STATUS_BAR[status])}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
