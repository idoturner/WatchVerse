import { Skeleton } from '@/shared/ui';

export function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-56 w-full rounded-lg" />
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <Skeleton className="aspect-[2/3] w-40 shrink-0 md:w-56" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
