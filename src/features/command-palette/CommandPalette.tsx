import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { routes } from '@/config/routes';
import { cn } from '@/shared/lib/cn';

interface Command {
  label: string;
  to: string;
  keywords?: string;
}

const COMMANDS: Command[] = [
  { label: 'Home', to: routes.home },
  { label: 'Dashboard', to: routes.dashboard, keywords: 'stats statistics' },
  { label: 'Discover', to: routes.discover, keywords: 'search browse find' },
  { label: 'Library', to: routes.library, keywords: 'tracked watchlist' },
  { label: 'Collections', to: routes.collections },
  { label: 'Cinema Mode', to: routes.cinema, keywords: 'random pick reel' },
  { label: 'Settings', to: routes.settings, keywords: 'preferences data export import reset' },
];

/**
 * Minimal, accessible command palette: a keyboard-driven jump to major routes. Opens with
 * Cmd/Ctrl+K, filters by label/keywords, navigates with ↑/↓ + Enter or click, closes on Esc.
 * Deliberately routes-only — not a broad quick-action framework.
 */
export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => `${c.label} ${c.keywords ?? ''}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => setActive(0), [query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const go = (to: string) => {
    close();
    navigate(to);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const choice = results[active];
      if (choice) go(choice.to);
    }
  };

  const activeId = results[active] ? `cmd-${results[active].to}` : undefined;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[300] bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[15vh] z-[300] w-[min(32rem,92vw)] -translate-x-1/2 overflow-hidden rounded-lg border border-border-subtle bg-bg-elevated shadow-xl focus:outline-none"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-border-subtle px-3">
            <Search className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden="true" />
            {/* Radix auto-focuses this (first focusable) on open. */}
            <input
              role="combobox"
              aria-expanded
              aria-controls="command-list"
              aria-activedescendant={activeId}
              aria-label="Search commands and pages"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Go to…"
              className="h-12 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </div>
          <ul
            id="command-list"
            role="listbox"
            aria-label="Pages"
            className="max-h-72 overflow-auto p-1"
          >
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-text-tertiary">
                No matching pages
              </li>
            ) : (
              results.map((command, i) => (
                <li
                  key={command.to}
                  id={`cmd-${command.to}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(command.to)}
                  className={cn(
                    'cursor-pointer rounded px-3 py-2 text-sm',
                    i === active ? 'bg-bg-surface text-text-primary' : 'text-text-secondary',
                  )}
                >
                  {command.label}
                </li>
              ))
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
