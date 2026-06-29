import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { CommandPalette } from './CommandPalette';

function openPalette() {
  fireEvent.keyDown(window, { key: 'k', metaKey: true });
}

describe('CommandPalette', () => {
  it('opens with the keyboard shortcut and lists pages', () => {
    renderWithProviders(<CommandPalette />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    openPalette();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Settings' })).toBeInTheDocument();
  });

  it('filters by query and closes on Escape', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CommandPalette />);
    openPalette();

    await user.type(screen.getByRole('combobox'), 'lib');
    expect(screen.getByRole('option', { name: 'Library' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Home' })).not.toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
