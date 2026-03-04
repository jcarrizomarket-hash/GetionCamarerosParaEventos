import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIdiomas } from '../../hooks/useIdiomas';
import { IDIOMAS } from '../../components/camareros/types';

const BASE_URL = 'https://test.supabase.co/functions/v1/make-server-test';
const ANON_KEY = 'test-anon-key';

describe('useIdiomas', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with IDIOMAS fallback values and loading=true before fetch resolves', () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useIdiomas(BASE_URL, ANON_KEY));
    // Immediately the default (IDIOMAS) should be in state and loading=true
    expect(result.current.idiomas).toEqual(IDIOMAS);
    expect(result.current.loading).toBe(true);
  });

  it('returns DB idiomas when fetch succeeds', async () => {
    const dbIdiomas = [
      { id: 1, nombre: 'Castellano' },
      { id: 2, nombre: 'Inglés' },
      { id: 3, nombre: 'Francés' },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: dbIdiomas }),
    } as Response);

    const { result } = renderHook(() => useIdiomas(BASE_URL, ANON_KEY));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(['Castellano', 'Inglés', 'Francés']);
    expect(result.current.error).toBeNull();
  });

  it('falls back to IDIOMAS constant when fetch fails', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useIdiomas(BASE_URL, ANON_KEY));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(IDIOMAS);
    expect(result.current.error).toBe('Network error');
  });

  it('falls back to IDIOMAS constant when response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useIdiomas(BASE_URL, ANON_KEY));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(IDIOMAS);
    expect(result.current.error).toContain('500');
  });

  it('falls back to IDIOMAS constant when DB returns empty array', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    } as Response);

    const { result } = renderHook(() => useIdiomas(BASE_URL, ANON_KEY));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(IDIOMAS);
  });

  it('falls back to IDIOMAS constant when response success is false', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'Table not found' }),
    } as Response);

    const { result } = renderHook(() => useIdiomas(BASE_URL, ANON_KEY));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.idiomas).toEqual(IDIOMAS);
  });

  it('does not fetch when baseUrl is empty', () => {
    const { result } = renderHook(() => useIdiomas('', ANON_KEY));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('does not fetch when anonKey is empty', () => {
    const { result } = renderHook(() => useIdiomas(BASE_URL, ''));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('calls the correct endpoint with Authorization header', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [{ id: 1, nombre: 'Castellano' }] }),
    } as Response);

    renderHook(() => useIdiomas(BASE_URL, ANON_KEY));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    expect(global.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/idiomas`,
      expect.objectContaining({
        headers: { Authorization: `Bearer ${ANON_KEY}` },
      })
    );
  });
});
