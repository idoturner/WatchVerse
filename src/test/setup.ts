import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './msw/server';

// TMDB requests are mocked; provide a token so the client doesn't short-circuit.
vi.stubEnv('VITE_TMDB_ACCESS_TOKEN', 'test-token');

// jsdom lacks these APIs that Radix menus rely on.
Object.defineProperty(Element.prototype, 'scrollIntoView', { value: vi.fn(), writable: true });
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  value: vi.fn(() => false),
  writable: true,
});
Object.defineProperty(Element.prototype, 'setPointerCapture', { value: vi.fn(), writable: true });
Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  writable: true,
});
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

// jsdom lacks matchMedia (used by reduced-motion resolution).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
