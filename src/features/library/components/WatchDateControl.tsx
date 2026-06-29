import { isValidWatchDate, todayDate } from '@/domain/library';
import { Input } from '@/shared/ui';

export interface WatchDateControlProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

/** Watch date picker (date-only, not in the future). Empty clears the date. */
export function WatchDateControl({ value, onChange }: WatchDateControlProps) {
  return (
    <Input
      type="date"
      aria-label="Watch date"
      max={todayDate()}
      value={value ?? ''}
      className="w-44"
      onChange={(e) => {
        const next = e.target.value;
        if (next === '') onChange(null);
        else if (isValidWatchDate(next)) onChange(next);
      }}
    />
  );
}
