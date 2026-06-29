import { useEffect, useState } from 'react';
import { normalizeReview } from '@/domain/library';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Textarea } from '@/shared/ui';

export interface ReviewControlProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

/**
 * Optional, private, plain-text review (≤500 chars). Autosaves debounced and on
 * blur; shows a live character count. The single canonical Review field.
 */
export function ReviewControl({ value, onChange }: ReviewControlProps) {
  const [text, setText] = useState(value ?? '');
  const debounced = useDebounce(text, 800);

  useEffect(() => {
    const normalized = normalizeReview(debounced);
    if (normalized !== (value ?? null)) onChange(normalized);
  }, [debounced, value, onChange]);

  const saveNow = () => {
    const normalized = normalizeReview(text);
    if (normalized !== (value ?? null)) onChange(normalized);
  };

  return (
    <div>
      <Textarea
        value={text}
        maxLength={500}
        rows={3}
        aria-label="Your review"
        placeholder="Add a short, private note or review…"
        onChange={(e) => setText(e.target.value)}
        onBlur={saveNow}
      />
      <div className="mt-1 flex justify-between text-xs text-text-tertiary">
        <span>Private · saved automatically</span>
        <span aria-live="polite">{text.length}/500</span>
      </div>
    </div>
  );
}
