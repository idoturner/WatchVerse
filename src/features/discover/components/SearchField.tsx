import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Film, Search, X } from 'lucide-react';
import { routes } from '@/config/routes';
import { useSearchSuggestions } from '@/data/tmdb/queries/useSearchSuggestions';
import type { TmdbTitle } from '@/domain/types';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/cn';
import { Input } from '@/shared/ui';
import { useSearchHistoryStore } from '@/stores/searchHistoryStore';

type Option =
  | { kind: 'recent'; key: string; label: string; query: string }
  | { kind: 'query'; key: string; label: string; query: string }
  | { kind: 'title'; key: string; label: string; title: TmdbTitle };

/**
 * Global search as an accessible combobox: recent searches when empty, title
 * suggestions while typing. Keyboard: ↑/↓ to move, Enter to select, Esc to close.
 */
export function SearchField() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [text, setText] = useState(searchParams.get('q') ?? '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recent = useSearchHistoryStore((s) => s.items);
  const addHistory = useSearchHistoryStore((s) => s.add);
  const removeHistory = useSearchHistoryStore((s) => s.remove);
  const clearHistory = useSearchHistoryStore((s) => s.clear);

  const debounced = useDebounce(text, 250);
  const suggestions = useSearchSuggestions(debounced);

  const trimmed = text.trim();
  const options = useMemo<Option[]>(() => {
    if (trimmed === '') {
      return recent.map((r) => ({
        kind: 'recent',
        key: `recent-${r.query}`,
        label: r.query,
        query: r.query,
      }));
    }
    const titleOptions: Option[] = (suggestions.data ?? []).map((t) => ({
      kind: 'title',
      key: `title-${t.mediaType}-${t.tmdbId}`,
      label: t.title,
      title: t,
    }));
    return [
      { kind: 'query', key: 'query', label: `Search “${trimmed}”`, query: trimmed },
      ...titleOptions,
    ];
  }, [trimmed, recent, suggestions.data]);

  useEffect(() => setActiveIndex(-1), [trimmed]);

  const runSearch = (query: string) => {
    const q = query.trim();
    if (!q) return;
    void addHistory(q);
    setOpen(false);
    const next = new URLSearchParams(window.location.search);
    next.set('q', q);
    navigate({ pathname: routes.discover, search: `?${next.toString()}` });
  };

  const selectOption = (option: Option) => {
    if (option.kind === 'title') {
      setOpen(false);
      navigate(routes.title(option.title.mediaType, option.title.tmdbId));
    } else {
      setText(option.query);
      runSearch(option.query);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const active = activeIndex >= 0 ? options[activeIndex] : undefined;
      if (active) selectOption(active);
      else runSearch(text);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showList = open && options.length > 0;
  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;

  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
      />
      <Input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls="search-listbox"
        aria-autocomplete="list"
        aria-activedescendant={activeOption?.key}
        aria-label="Search movies and TV shows"
        placeholder="Search movies & TV…"
        className="pl-9"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={onKeyDown}
      />

      {showList ? (
        <ul
          id="search-listbox"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-[200] mt-1 max-h-80 w-full overflow-auto rounded-md border border-border-subtle bg-bg-elevated p-1 shadow-lg"
        >
          {trimmed === '' && recent.length > 0 ? (
            <li className="flex items-center justify-between px-2 py-1 text-xs text-text-tertiary">
              <span>Recent searches</span>
              <button
                type="button"
                className="hover:text-text-primary"
                onMouseDown={(e) => {
                  e.preventDefault();
                  void clearHistory();
                }}
              >
                Clear
              </button>
            </li>
          ) : null}

          {options.map((option, i) => (
            <li
              key={option.key}
              id={option.key}
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option);
              }}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1.5 text-sm',
                i === activeIndex ? 'bg-bg-surface text-text-primary' : 'text-text-secondary',
              )}
            >
              <span className="flex min-w-0 items-center gap-2">
                {option.kind === 'recent' ? (
                  <Clock aria-hidden="true" className="h-4 w-4 shrink-0" />
                ) : option.kind === 'title' ? (
                  <Film aria-hidden="true" className="h-4 w-4 shrink-0" />
                ) : (
                  <Search aria-hidden="true" className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{option.label}</span>
              </span>
              {option.kind === 'recent' ? (
                <button
                  type="button"
                  aria-label={`Remove ${option.query} from recent searches`}
                  className="shrink-0 text-text-tertiary hover:text-text-primary"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void removeHistory(option.query);
                  }}
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
