import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import type { RatingBucket } from '@/domain/stats';

/**
 * Ratings distribution as a small bar chart, plus a text summary and an
 * sr-only data table so it isn't conveyed by color/shape alone.
 */
export function RatingsChart({
  distribution,
  count,
}: {
  distribution: RatingBucket[];
  count: number;
}) {
  const mostCommon = [...distribution].sort((a, b) => b.count - a.count)[0];
  const summary =
    mostCommon && mostCommon.count > 0
      ? `You've rated ${count} ${count === 1 ? 'title' : 'titles'}, most often ${mostCommon.rating}/10.`
      : `You've rated ${count} ${count === 1 ? 'title' : 'titles'}.`;

  return (
    <div>
      <p className="mb-2 text-sm text-text-secondary">{summary}</p>
      <div aria-hidden="true">
        <BarChart width={320} height={160} data={distribution}>
          <XAxis dataKey="rating" tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" />
          <YAxis
            allowDecimals={false}
            width={24}
            tick={{ fontSize: 11 }}
            stroke="var(--text-tertiary)"
          />
          <Bar dataKey="count" fill="var(--color-highlight)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </div>
      <table className="sr-only">
        <caption>Ratings distribution</caption>
        <thead>
          <tr>
            <th>Rating</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {distribution.map((bucket) => (
            <tr key={bucket.rating}>
              <td>{bucket.rating}</td>
              <td>{bucket.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
