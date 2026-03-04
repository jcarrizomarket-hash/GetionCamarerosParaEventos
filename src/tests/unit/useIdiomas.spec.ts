/**
 * Unit tests for the useIdiomas hook
 *
 * Verifies:
 *  1. Returns IDIOMAS fallback on a Supabase error.
 *  2. Returns DB rows when the fetch succeeds.
 *  3. Returns IDIOMAS fallback when the DB returns an empty list.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { IDIOMAS } from '../../components/camareros/types';

// ── Mock the Supabase client ──────────────────────────────────────────────────
// vi.hoisted ensures these functions are available when vi.mock factory runs
// (vi.mock calls are hoisted to the top of the file by Vitest).
const { mockOrder, mockEq, mockSelect, mockFrom } = vi.hoisted(() => {
  const mockOrder = vi.fn();
  const mockEq = vi.fn(() => ({ order: mockOrder }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  return { mockOrder, mockEq, mockSelect, mockFrom };
});

vi.mock('../../utils/supabaseClient', () => ({
  supabaseClient: { from: mockFrom },
}));

// Import AFTER mocking so the hook picks up the mock
import { useIdiomas } from '../../hooks/useIdiomas';

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Re-wire the chain after each clearAllMocks so the stubs stay connected.
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ order: mockOrder });
});

describe('useIdiomas', () => {
  it('returns IDIOMAS fallback and an error message when the DB call fails', async () => {
    mockOrder.mockResolvedValueOnce({
      data: null,
      error: new Error('DB connection refused'),
    });

    const { result } = renderHook(() => useIdiomas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(IDIOMAS);
    expect(result.current.error).toBeTruthy();
  });

  it('returns the list from the DB when the fetch succeeds', async () => {
    const dbRows = [
      { name: 'Castellano', sort_order: 1 },
      { name: 'Inglés', sort_order: 2 },
    ];

    mockOrder.mockResolvedValueOnce({ data: dbRows, error: null });

    const { result } = renderHook(() => useIdiomas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(['Castellano', 'Inglés']);
    expect(result.current.error).toBeNull();
  });

  it('keeps the IDIOMAS fallback when the DB returns an empty array', async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    const { result } = renderHook(() => useIdiomas());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(IDIOMAS);
    expect(result.current.error).toBeNull();
  });
});
