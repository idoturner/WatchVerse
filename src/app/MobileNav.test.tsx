import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import { MobileNav, type NavItem } from './MobileNav';

const items: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/library', label: 'Library', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

describe('MobileNav', () => {
  it('opens the menu and exposes all routes, then closes on selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileNav items={items} />);

    const toggle = screen.getByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('navigation', { name: 'Main' });
    expect(menu).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Library' }));
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MobileNav items={items} />);
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
  });
});
