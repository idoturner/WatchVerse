import { describe, expect, it } from 'vitest';
import type { LibraryEntry } from '@/domain/types';
import { buildRollFrames, ROLL_FRAMES, rollFrameDelay } from './roll';

const entry = (id: string): LibraryEntry => ({ id }) as unknown as LibraryEntry;

describe('buildRollFrames', () => {
  const candidates = [entry('a'), entry('b'), entry('c')];
  const final = entry('final');

  it('produces the requested number of frames and always lands on the real pick', () => {
    const frames = buildRollFrames(candidates, final, ROLL_FRAMES);
    expect(frames).toHaveLength(ROLL_FRAMES);
    expect(frames[frames.length - 1]).toBe(final);
  });

  it('draws intermediate frames from the candidate pool (deterministic rng)', () => {
    const frames = buildRollFrames(candidates, final, 4, () => 0); // always index 0 → 'a'
    expect(frames.slice(0, -1).every((f) => f.id === 'a')).toBe(true);
    expect(frames[frames.length - 1]).toBe(final);
  });

  it('falls back to just the final pick when there are no candidates', () => {
    expect(buildRollFrames([], final)).toEqual([final]);
  });
});

describe('rollFrameDelay', () => {
  it('eases out — delays are non-decreasing and bounded', () => {
    const delays = Array.from({ length: ROLL_FRAMES }, (_, i) => rollFrameDelay(i, ROLL_FRAMES));
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]!);
    }
    expect(Math.min(...delays)).toBeGreaterThanOrEqual(80);
    expect(Math.max(...delays)).toBeLessThanOrEqual(300);
  });

  it('keeps the whole roll within a premium ~1–2s window', () => {
    // Sum the delays actually used (every frame except the final settle).
    let total = 0;
    for (let i = 0; i < ROLL_FRAMES - 1; i++) total += rollFrameDelay(i, ROLL_FRAMES);
    expect(total).toBeGreaterThan(700);
    expect(total).toBeLessThan(2000);
  });
});
