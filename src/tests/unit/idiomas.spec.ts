/**
 * Unit tests for useIdiomas hook
 * Tests the mapping logic and fallback behaviour in isolation.
 */

import { describe, it, expect } from 'vitest';
import { IDIOMAS } from '../../components/camareros/types';
import { mapIdioma } from '../../hooks/useIdiomas';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('mapIdioma', () => {
  it('maps a DB row to a language name string', () => {
    const row = {
      id: 1,
      name: 'Castellano',
      sort_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(mapIdioma(row)).toBe('Castellano');
  });

  it('preserves the exact name from the DB row', () => {
    const row = {
      id: 4,
      name: 'Inglés',
      sort_order: 4,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(mapIdioma(row)).toBe('Inglés');
  });
});

describe('IDIOMAS fallback', () => {
  it('contains the seven default languages', () => {
    expect(IDIOMAS).toHaveLength(7);
    expect(IDIOMAS).toContain('Castellano');
    expect(IDIOMAS).toContain('Portugués');
    expect(IDIOMAS).toContain('Catalán');
    expect(IDIOMAS).toContain('Inglés');
    expect(IDIOMAS).toContain('Francés');
    expect(IDIOMAS).toContain('Alemán');
    expect(IDIOMAS).toContain('Italiano');
  });

  it('each entry is a non-empty string', () => {
    for (const idioma of IDIOMAS) {
      expect(idioma).toBeTruthy();
      expect(typeof idioma).toBe('string');
    }
  });

  it('maps correctly from DB rows for seeding verification', () => {
    const dbRows = [
      { id: 1, name: 'Castellano', sort_order: 1, is_active: true, created_at: '' },
      { id: 2, name: 'Portugués',  sort_order: 2, is_active: true, created_at: '' },
      { id: 3, name: 'Catalán',    sort_order: 3, is_active: true, created_at: '' },
      { id: 4, name: 'Inglés',     sort_order: 4, is_active: true, created_at: '' },
      { id: 5, name: 'Francés',    sort_order: 5, is_active: true, created_at: '' },
      { id: 6, name: 'Alemán',     sort_order: 6, is_active: true, created_at: '' },
      { id: 7, name: 'Italiano',   sort_order: 7, is_active: true, created_at: '' },
    ];

    const mapped = dbRows.map(mapIdioma);

    expect(mapped).toEqual(IDIOMAS);
  });
});
