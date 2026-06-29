import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setRepository } from '@/data/repository/activeRepository';
import { createLocalStorageLibraryRepository } from '@/data/repository/localStorage/LocalStorageLibraryRepository';
import { createMemoryStore } from '@/data/repository/localStorage/keyValueStore';
import { defaultSettings } from '@/domain/defaults';
import { renderWithProviders } from '@/test/utils';
import { useSettingsStore } from '@/stores/settingsStore';
import { SettingsScreen } from './SettingsScreen';

describe('SettingsScreen', () => {
  beforeEach(() => {
    setRepository(createLocalStorageLibraryRepository(createMemoryStore()));
    useSettingsStore.setState({ settings: defaultSettings(), hydrated: true });
  });

  it('renders the settings sections and version', () => {
    renderWithProviders(<SettingsScreen />);
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your data' })).toBeInTheDocument();
    expect(screen.getByText(/^v\d+\.\d+\.\d+/)).toBeInTheDocument();
  });

  it('toggles spoiler protection and persists it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsScreen />);

    const toggle = screen.getByRole('switch', { name: /spoiler protection/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    expect(useSettingsStore.getState().settings.spoilerProtection).toBe(true);

    // Persisted: reload from the repository.
    useSettingsStore.setState({ settings: defaultSettings(), hydrated: false });
    await useSettingsStore.getState().hydrate();
    expect(useSettingsStore.getState().settings.spoilerProtection).toBe(true);
  });

  it('changes the reduced-motion preference', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsScreen />);
    await user.selectOptions(screen.getByLabelText('Motion'), 'on');
    expect(useSettingsStore.getState().settings.reducedMotion).toBe('on');
  });

  it('offers a strongly-confirmed reset control', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsScreen />);
    await user.click(screen.getByRole('button', { name: /clear all data/i }));
    expect(screen.getByRole('dialog', { name: /clear all watchverse data/i })).toBeInTheDocument();
  });
});
