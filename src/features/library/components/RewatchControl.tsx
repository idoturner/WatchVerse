import { Minus, Plus } from 'lucide-react';
import { Button } from '@/shared/ui';

export interface RewatchControlProps {
  value: number;
  onChange: (value: number) => void;
}

/** Non-negative rewatch counter with accessible increment/decrement. */
export function RewatchControl({ value, onChange }: RewatchControlProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        aria-label="Decrease rewatch count"
        disabled={value <= 0}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>
      <span
        className="min-w-[1.5rem] text-center tabular-nums text-text-primary"
        aria-live="polite"
      >
        {value}
      </span>
      <Button
        variant="secondary"
        size="sm"
        aria-label="Increase rewatch count"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
