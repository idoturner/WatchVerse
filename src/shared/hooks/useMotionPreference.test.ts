import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMotionPreference } from './useMotionPreference';

describe('useMotionPreference', () => {
  afterEach(() => {
    delete document.documentElement.dataset.motion;
  });

  it('forces reduced motion when set to "on"', () => {
    renderHook(() => useMotionPreference('on'));
    expect(document.documentElement.dataset.motion).toBe('reduced');
  });

  it('allows motion when set to "off" (overriding the OS)', () => {
    renderHook(() => useMotionPreference('off'));
    expect(document.documentElement.dataset.motion).toBe('full');
  });

  it('follows the system preference when set to "system"', () => {
    // The test matchMedia mock reports no reduced-motion preference.
    renderHook(() => useMotionPreference('system'));
    expect(document.documentElement.dataset.motion).toBe('full');
  });
});
