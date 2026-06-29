import { useEffect } from 'react';
import type { Settings } from '@/domain/types';

/**
 * Resolves the user's reduced-motion preference to a concrete value and records it on
 * <html data-motion>. "system" follows the OS (and updates live); "on"/"off" override
 * it in either direction. The CSS in globals.css reacts to the attribute.
 */
export function useMotionPreference(preference: Settings['reducedMotion']): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    const apply = () => {
      const reduced = preference === 'on' || (preference === 'system' && query.matches);
      document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    };
    apply();

    if (preference !== 'system') return;
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, [preference]);
}
