import { cn } from '@/shared/lib/cn';

/** Loading placeholder. Pulse is suppressed under reduced-motion (see globals.css). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-bg-elevated', className)} />
  );
}
