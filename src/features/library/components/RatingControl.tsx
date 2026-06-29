import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/shared/ui';

const STARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export interface RatingControlProps {
  value: number | null;
  onChange: (value: number | null) => void;
  titleLabel?: string;
}

/**
 * 10-point rating in 0.5 steps. An accessible slider (keyboard arrows ±0.5,
 * Home/End) with clickable star halves for mouse/touch; the numeric value and
 * aria-valuetext mean it never relies on stars alone.
 */
export function RatingControl({ value, onChange, titleLabel }: RatingControlProps) {
  const current = value ?? 0;

  const setClamped = (next: number) => onChange(Math.min(10, Math.max(0.5, next)));

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        setClamped(current + 0.5);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        if (current <= 0.5) onChange(null);
        else setClamped(current - 0.5);
        break;
      case 'Home':
        event.preventDefault();
        onChange(0.5);
        break;
      case 'End':
        event.preventDefault();
        onChange(10);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        role="slider"
        tabIndex={0}
        aria-label={titleLabel ? `Your rating for ${titleLabel}` : 'Your rating'}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={current}
        aria-valuetext={value === null ? 'Not rated' : `${value} out of 10`}
        onKeyDown={onKeyDown}
        className="inline-flex rounded focus-visible:outline-none"
      >
        {STARS.map((i) => {
          const filled = current >= i;
          const half = !filled && current >= i - 0.5;
          return (
            <span key={i} className="relative inline-block h-6 w-6">
              <Star aria-hidden="true" className="absolute inset-0 h-6 w-6 text-border-strong" />
              {filled ? (
                <Star
                  aria-hidden="true"
                  className="absolute inset-0 h-6 w-6 fill-highlight text-highlight"
                />
              ) : null}
              {half ? (
                <StarHalf
                  aria-hidden="true"
                  className="absolute inset-0 h-6 w-6 fill-highlight text-highlight"
                />
              ) : null}
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={() => onChange(i - 0.5)}
                className="absolute inset-y-0 left-0 w-1/2"
              />
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={() => onChange(i)}
                className="absolute inset-y-0 right-0 w-1/2"
              />
            </span>
          );
        })}
      </div>

      <span className="text-sm tabular-nums text-text-secondary">
        {value === null ? 'Not rated' : `${value.toFixed(1)}/10`}
      </span>

      {value !== null ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
