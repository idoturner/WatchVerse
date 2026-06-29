import { Card } from '@/shared/ui';

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-text-primary">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-text-tertiary">{hint}</p> : null}
    </Card>
  );
}
