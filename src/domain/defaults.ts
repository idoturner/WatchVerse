import type { Profile, Settings } from './types';

export function defaultSettings(now: string = new Date().toISOString()): Settings {
  return {
    defaultView: 'grid',
    defaultSort: 'date_added',
    posterDensity: 'comfortable',
    reducedMotion: 'system',
    theme: 'cinema-dark',
    defaultLanding: 'home',
    confirmBeforeDelete: true,
    autoplayTrailers: false,
    spoilerProtection: false,
    contentLanguage: 'en-US',
    onboardingCompleted: false,
    updatedAt: now,
  };
}

export function defaultProfile(now: string = new Date().toISOString()): Profile {
  return {
    displayName: 'You',
    createdAt: now,
    updatedAt: now,
  };
}
