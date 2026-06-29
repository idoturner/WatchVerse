import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { defaultSettings } from '@/domain/defaults';
import { renderWithProviders } from '@/test/utils';
import { useSettingsStore } from '@/stores/settingsStore';
import { OnboardingDialog } from './OnboardingDialog';

describe('OnboardingDialog', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
  });

  it('shows on first run and persists completion when dismissed', async () => {
    const user = userEvent.setup();
    useSettingsStore.setState({
      settings: { ...defaultSettings(), onboardingCompleted: false },
      hydrated: true,
    });
    renderWithProviders(<OnboardingDialog />);
    expect(screen.getByRole('dialog', { name: /welcome to watchverse/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Get started' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(useSettingsStore.getState().settings.onboardingCompleted).toBe(true);
  });

  it('does not show once onboarding is complete', () => {
    useSettingsStore.setState({
      settings: { ...defaultSettings(), onboardingCompleted: true },
      hydrated: true,
    });
    renderWithProviders(<OnboardingDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stays hidden until settings have hydrated', () => {
    useSettingsStore.setState({
      settings: { ...defaultSettings(), onboardingCompleted: false },
      hydrated: false,
    });
    renderWithProviders(<OnboardingDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
