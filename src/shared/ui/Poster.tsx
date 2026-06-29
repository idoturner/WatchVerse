import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from './Skeleton';

export interface PosterProps {
  src: string | null;
  alt: string;
  className?: string;
}

/**
 * The hero primitive. Locks the original 2:3 poster aspect — artwork is never
 * stretched, distorted, or arbitrarily cropped (Design System §9.1). Lazy-loads
 * with a skeleton, fades in on load, and shows an on-brand placeholder when missing.
 */
export function Poster({ src, alt, className }: PosterProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const showImage = src !== null && !errored;

  return (
    <div
      className={cn('relative aspect-[2/3] overflow-hidden rounded-md bg-bg-surface', className)}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-base',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="grid h-full w-full place-items-center text-text-tertiary"
        >
          <ImageOff aria-hidden="true" className="h-8 w-8" />
        </div>
      )}
      {showImage && !loaded ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
    </div>
  );
}
