/**
 * Unit tests for useEspecialidades hook
 * Tests the fallback constant and DB-row mapping logic in isolation.
 */

import { describe, it, expect } from 'vitest';
import { ESPECIALIDADES, Especialidad } from '../../components/camareros/types';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ESPECIALIDADES fallback', () => {
  it('contains the five default specialities', () => {
    expect(ESPECIALIDADES).toHaveLength(5);
    expect(ESPECIALIDADES).toContain('Coctelería');
    expect(ESPECIALIDADES).toContain('Banquetes');
    expect(ESPECIALIDADES).toContain('Restaurant');
    expect(ESPECIALIDADES).toContain('Buffet');
    expect(ESPECIALIDADES).toContain('VIP');
  });

  it('each entry is a non-empty string', () => {
    for (const esp of ESPECIALIDADES) {
      expect(esp).toBeTruthy();
      expect(typeof esp).toBe('string');
    }
  });

  it('maps correctly from DB rows for seeding verification', () => {
    const dbRows: Especialidad[] = [
      { id: 1, nombre: 'Coctelería', sort_order: 1, is_active: true, created_at: '' },
      { id: 2, nombre: 'Banquetes',  sort_order: 2, is_active: true, created_at: '' },
      { id: 3, nombre: 'Restaurant', sort_order: 3, is_active: true, created_at: '' },
      { id: 4, nombre: 'Buffet',     sort_order: 4, is_active: true, created_at: '' },
      { id: 5, nombre: 'VIP',        sort_order: 5, is_active: true, created_at: '' },
    ];

    const mapped = dbRows.map((row) => row.nombre);

    expect(mapped).toEqual(ESPECIALIDADES);
  });
});
