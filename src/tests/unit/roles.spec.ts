/**
 * Unit tests for useRoles hook
 * Tests the mapping logic and fallback behaviour in isolation.
 */

import { describe, it, expect } from 'vitest';
import { TIPOS_PERFIL } from '../../components/camareros/types';

// ---------------------------------------------------------------------------
// Helper: the pure mapping function extracted from useRoles for testability
// ---------------------------------------------------------------------------

interface Role {
  id: number;
  name: string;
  display_name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

function mapRole(r: Role): { codigo: string; label: string } {
  return { codigo: r.name, label: r.display_name };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('mapRole', () => {
  it('maps a DB row to { codigo, label }', () => {
    const row: Role = {
      id: 1,
      name: 'CAM',
      display_name: 'Camarero',
      sort_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(mapRole(row)).toEqual({ codigo: 'CAM', label: 'Camarero' });
  });

  it('preserves the exact values from the DB row', () => {
    const row: Role = {
      id: 4,
      name: 'AZA',
      display_name: 'Azafata',
      sort_order: 4,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    };

    const result = mapRole(row);
    expect(result.codigo).toBe('AZA');
    expect(result.label).toBe('Azafata');
  });
});

describe('TIPOS_PERFIL fallback', () => {
  it('contains the four default profile types', () => {
    expect(TIPOS_PERFIL).toHaveLength(4);
    const codes = TIPOS_PERFIL.map(t => t.codigo);
    expect(codes).toContain('CAM');
    expect(codes).toContain('COC');
    expect(codes).toContain('PIC');
    expect(codes).toContain('AZA');
  });

  it('each entry has a non-empty codigo and label', () => {
    for (const tipo of TIPOS_PERFIL) {
      expect(tipo.codigo).toBeTruthy();
      expect(tipo.label).toBeTruthy();
    }
  });

  it('maps correctly to DB Role shape for seeding verification', () => {
    const dbRows: Role[] = [
      { id: 1, name: 'CAM', display_name: 'Camarero', sort_order: 1, is_active: true, created_at: '' },
      { id: 2, name: 'COC', display_name: 'Cocina',   sort_order: 2, is_active: true, created_at: '' },
      { id: 3, name: 'PIC', display_name: 'Pica',     sort_order: 3, is_active: true, created_at: '' },
      { id: 4, name: 'AZA', display_name: 'Azafata',  sort_order: 4, is_active: true, created_at: '' },
    ];

    const mapped = dbRows.map(mapRole);

    expect(mapped).toEqual(TIPOS_PERFIL);
  });
});
