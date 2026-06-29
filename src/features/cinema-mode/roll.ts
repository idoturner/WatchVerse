import type { LibraryEntry } from '@/domain/types';

/** Number of poster frames shown during the roulette roll (including the final pick). */
export const ROLL_FRAMES = 8;

/**
 * Build the intermediate poster frames for the Cinema Mode roulette, ending on the real
 * pick. Presentation only — it never changes which title is selected (that comes from
 * pickRandomEntry). Pure and injectable for tests.
 */
export function buildRollFrames(
  candidates: LibraryEntry[],
  final: LibraryEntry,
  count: number = ROLL_FRAMES,
  rng: () => number = Math.random,
): LibraryEntry[] {
  if (candidates.length === 0) return [final];
  const frames: LibraryEntry[] = [];
  for (let i = 0; i < Math.max(0, count - 1); i++) {
    const index = Math.floor(rng() * candidates.length) % candidates.length;
    frames.push(candidates[index] ?? final);
  }
  frames.push(final); // the roll always lands on the real pick
  return frames;
}

/**
 * Ease-out per-frame delay (ms): quick at the start, slowing toward the final card so the
 * reel "settles" rather than stopping abruptly. Total ≈ 1s for ROLL_FRAMES.
 */
export function rollFrameDelay(index: number, count: number): number {
  if (count <= 1) return 0;
  const t = index / (count - 1); // 0 → 1
  return Math.round(80 + t * t * 220); // ~80ms → ~300ms
}
