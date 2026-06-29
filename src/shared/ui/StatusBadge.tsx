import { Bookmark, Check, Pause, Play, X, type LucideIcon } from 'lucide-react';
import { STATUS_LABELS } from '@/domain/status';
import type { WatchStatus } from '@/domain/types';
import { cn } from '@/shared/lib/cn';

interface StatusVisual {
  icon: LucideIcon;
  color: string;
}

/**
 * Fixed color + icon per status (label comes from the canonical STATUS_LABELS).
 * Per the Design System rule, status is always communicated with all three
 * together — never color alone (PRD-SYS-11).
 */
const STATUS_VISUAL: Record<WatchStatus, StatusVisual> = {
  want: { icon: Bookmark, color: 'text-status-want' },
  watching: { icon: Play, color: 'text-status-watching' },
  completed: { icon: Check, color: 'text-status-completed' },
  on_hold: { icon: Pause, color: 'text-status-onhold' },
  dropped: { icon: X, color: 'text-status-dropped' },
};

export function StatusBadge({ status, className }: { status: WatchStatus; className?: string }) {
  const { icon: Icon, color } = STATUS_VISUAL[status];
  const label = STATUS_LABELS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-bg-base px-2 py-0.5 text-xs font-medium',
        color,
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-3 w-3" />
      {label}
    </span>
  );
}
