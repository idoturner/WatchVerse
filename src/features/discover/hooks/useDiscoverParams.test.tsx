import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDiscoverParams } from './useDiscoverParams';

function wrapper(initial: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
  );
}

describe('useDiscoverParams', () => {
  it('defaults to the Popular (relevance) sort, not Newest', () => {
    const { result } = renderHook(() => useDiscoverParams(), { wrapper: wrapper('/') });
    expect(result.current.params.sortKey).toBe('popular');
    expect(result.current.params.genreId).toBeNull();
    expect(result.current.params.year).toBeNull();
  });

  it('still honors an explicit Newest sort from the URL', () => {
    const { result } = renderHook(() => useDiscoverParams(), { wrapper: wrapper('/?sort=newest') });
    expect(result.current.params.sortKey).toBe('newest');
  });
});
