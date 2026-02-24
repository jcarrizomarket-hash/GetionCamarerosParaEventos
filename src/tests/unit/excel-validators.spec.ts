/**
 * Tests unitarios para validadores de Excel
 * Framework: Vitest
 */

import { describe, it, expect } from 'vitest';
import { ExcelValidator } from '../../src/utils/excel-validators';
import { normalizeRow } from '../../src/utils/excel-normalizer';
import { detectDuplicates } from '../../src/utils/excel-duplicate-detector';

// ---------------------------------------------------------------------------
// ExcelValidator.validateFile
// ---------------------------------------------------------------------------
describe('ExcelValidator.validateFile', () => {
  const makeFile = (name: string, type: string, size: number): File => {
    const blob = new Blob(['x'.repeat(size)], { type });
    return new File([blob], name, { type });
  };

  it('debe aceptar archivo .xlsx válido', () => {
    const file = makeFile(
      'datos.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      1024
    );
    expect(ExcelValidator.validateFile(file)).toHaveLength(0);
  });

  it('debe aceptar archivo .xls válido', () => {
    const file = makeFile('datos.xls', 'application/vnd.ms-excel', 1024);
    expect(ExcelValidator.validateFile(file)).toHaveLength(0);
  });

  it('debe aceptar archivo .csv válido', () => {
    const file = makeFile('datos.csv', 'text/csv', 1024);
    expect(ExcelValidator.validateFile(file)).toHaveLength(0);
  });

  it('debe rechazar archivos mayores a 5MB', () => {
    const file = makeFile(
      'grande.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      6 * 1024 * 1024
    );
    const errors = ExcelValidator.validateFile(file);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('5MB');
  });

  it('debe rechazar tipos de archivo no válidos', () => {
    const file = makeFile('datos.txt', 'text/plain', 100);
    const errors = ExcelValidator.validateFile(file);
    expect(errors.some(e => e.includes('no válido'))).toBe(true);
  });

  it('debe aceptar archivo con extensión correcta aunque el MIME no sea estándar', () => {
    const file = makeFile('datos.xlsx', 'application/octet-stream', 100);
    expect(ExcelValidator.validateFile(file)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// ExcelValidator.validateRowCount
// ---------------------------------------------------------------------------
describe('ExcelValidator.validateRowCount', () => {
  it('debe aceptar hasta 1000 filas', () => {
    expect(ExcelValidator.validateRowCount(1000)).toBeNull();
    expect(ExcelValidator.validateRowCount(500)).toBeNull();
    expect(ExcelValidator.validateRowCount(1)).toBeNull();
  });

  it('debe rechazar más de 1000 filas', () => {
    const error = ExcelValidator.validateRowCount(1001);
    expect(error).not.toBeNull();
    expect(error).toContain('1000');
  });
});

// ---------------------------------------------------------------------------
// ExcelValidator.validateRow
// ---------------------------------------------------------------------------
describe('ExcelValidator.validateRow', () => {
  it('debe aceptar una fila completamente válida', () => {
    const row = {
      Nombre: 'Juan',
      Apellido: 'García',
      'Teléfono': '+34 612345678',
      Email: 'juan@example.com',
      'Código': 'CAM001',
    };
    expect(ExcelValidator.validateRow(row, 2)).toHaveLength(0);
  });

  it('debe requerir Nombre', () => {
    const row = { Apellido: 'García' };
    const errors = ExcelValidator.validateRow(row, 2);
    expect(errors.some(e => e.field === 'Nombre')).toBe(true);
  });

  it('debe requerir Apellido', () => {
    const row = { Nombre: 'Juan' };
    const errors = ExcelValidator.validateRow(row, 2);
    expect(errors.some(e => e.field === 'Apellido')).toBe(true);
  });

  it('debe rechazar Nombre vacío', () => {
    const row = { Nombre: '   ', Apellido: 'García' };
    const errors = ExcelValidator.validateRow(row, 2);
    expect(errors.some(e => e.field === 'Nombre')).toBe(true);
  });

  it('debe rechazar Nombre que no es string', () => {
    const row = { Nombre: 123, Apellido: 'García' };
    const errors = ExcelValidator.validateRow(row, 2);
    expect(errors.some(e => e.field === 'Nombre')).toBe(true);
  });

  it('debe validar formato de email inválido', () => {
    const row = { Nombre: 'Juan', Apellido: 'García', Email: 'no-es-email' };
    const errors = ExcelValidator.validateRow(row, 2);
    expect(errors.some(e => e.field === 'Email')).toBe(true);
  });

  it('debe aceptar email válido', () => {
    const row = { Nombre: 'Juan', Apellido: 'García', Email: 'juan@test.com' };
    expect(ExcelValidator.validateRow(row, 2)).toHaveLength(0);
  });

  it('debe aceptar sin email (campo opcional)', () => {
    const row = { Nombre: 'Juan', Apellido: 'García' };
    expect(ExcelValidator.validateRow(row, 2)).toHaveLength(0);
  });

  it('debe validar formato de teléfono inválido', () => {
    const row = { Nombre: 'Juan', Apellido: 'García', 'Teléfono': 'abc' };
    const errors = ExcelValidator.validateRow(row, 2);
    expect(errors.some(e => e.field === 'Teléfono')).toBe(true);
  });

  it('debe aceptar teléfono válido', () => {
    const row = { Nombre: 'Juan', Apellido: 'García', 'Teléfono': '612345678' };
    expect(ExcelValidator.validateRow(row, 2)).toHaveLength(0);
  });

  it('debe aceptar sin teléfono (campo opcional)', () => {
    const row = { Nombre: 'Juan', Apellido: 'García' };
    expect(ExcelValidator.validateRow(row, 2)).toHaveLength(0);
  });

  it('debe validar formato de código inválido', () => {
    const row = { Nombre: 'Juan', Apellido: 'García', 'Código': 'a' }; // muy corto (1 char)
    const errors = ExcelValidator.validateRow(row, 2);
    expect(errors.some(e => e.field === 'Código')).toBe(true);
  });

  it('debe aceptar código válido en mayúsculas', () => {
    const row = { Nombre: 'Juan', Apellido: 'García', 'Código': 'CAM01' };
    expect(ExcelValidator.validateRow(row, 2)).toHaveLength(0);
  });

  it('debe aceptar código válido en minúsculas (normalizado después)', () => {
    const row = { Nombre: 'Juan', Apellido: 'García', 'Código': 'cam01' };
    expect(ExcelValidator.validateRow(row, 2)).toHaveLength(0);
  });

  it('debe incluir el número de fila en los errores', () => {
    const row = { Apellido: 'García' };
    const errors = ExcelValidator.validateRow(row, 5);
    expect(errors[0].row).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// normalizeRow
// ---------------------------------------------------------------------------
describe('normalizeRow', () => {
  it('debe capitalizar el nombre correctamente', () => {
    const result = normalizeRow({ Nombre: 'JUAN', Apellido: 'García' });
    expect(result.nombre).toBe('Juan');
  });

  it('debe poner el apellido en mayúsculas', () => {
    const result = normalizeRow({ Nombre: 'Juan', Apellido: 'garcía' });
    expect(result.apellido).toBe('GARCÍA');
  });

  it('debe eliminar espacios extra del email y convertirlo a minúsculas', () => {
    const result = normalizeRow({ Nombre: 'Juan', Apellido: 'García', Email: '  JUAN@TEST.COM  ' });
    expect(result.email).toBe('juan@test.com');
  });

  it('debe eliminar espacios del teléfono', () => {
    const result = normalizeRow({ Nombre: 'Juan', Apellido: 'García', 'Teléfono': '612 345 678' });
    expect(result.telefono).toBe('612345678');
  });

  it('debe poner el código en mayúsculas', () => {
    const result = normalizeRow({ Nombre: 'Juan', Apellido: 'García', 'Código': 'cam001' });
    expect(result.codigo).toBe('CAM001');
  });

  it('debe convertir especialidades separadas por coma en array', () => {
    const result = normalizeRow({ Nombre: 'Juan', Apellido: 'García', Especialidades: 'Coctelería, Banquetes' });
    expect(result.especialidades).toEqual(['Coctelería', 'Banquetes']);
  });

  it('debe asignar estado activo por defecto', () => {
    const result = normalizeRow({ Nombre: 'Juan', Apellido: 'García' });
    expect(result.estado).toBe('activo');
  });

  it('debe asignar tipoPerfil CAM por defecto', () => {
    const result = normalizeRow({ Nombre: 'Juan', Apellido: 'García' });
    expect(result.tipoPerfil).toBe('CAM');
  });
});

// ---------------------------------------------------------------------------
// detectDuplicates
// ---------------------------------------------------------------------------
describe('detectDuplicates', () => {
  it('debe detectar duplicados por nombre y apellido en el mismo archivo', () => {
    const rows = [
      { Nombre: 'Juan', Apellido: 'García' },
      { Nombre: 'Ana', Apellido: 'López' },
      { Nombre: 'Juan', Apellido: 'García' }, // duplicado
    ];
    const conflicts = detectDuplicates(rows, []);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].row1).toBe(2);
    expect(conflicts[0].row2).toBe(4);
  });

  it('debe detectar duplicados de código en el mismo archivo', () => {
    const rows = [
      { Nombre: 'Juan', Apellido: 'García', 'Código': 'CAM001' },
      { Nombre: 'Ana', Apellido: 'López', 'Código': 'CAM001' }, // código duplicado
    ];
    const conflicts = detectDuplicates(rows, []);
    expect(conflicts.some(c => c.reason.includes('CAM001'))).toBe(true);
  });

  it('debe detectar duplicados contra datos existentes por nombre', () => {
    const rows = [{ Nombre: 'Juan', Apellido: 'García' }];
    const existing = [{ nombre: 'Juan', apellido: 'García', codigo: 'CAM001' }];
    const conflicts = detectDuplicates(rows, existing);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].row1).toBe(0); // 0 = existing record
  });

  it('debe detectar código duplicado contra datos existentes', () => {
    const rows = [{ Nombre: 'Nuevo', Apellido: 'Camarero', 'Código': 'CAM001' }];
    const existing = [{ nombre: 'Juan', apellido: 'García', codigo: 'CAM001' }];
    const conflicts = detectDuplicates(rows, existing);
    expect(conflicts.some(c => c.reason.includes('CAM001'))).toBe(true);
  });

  it('debe retornar array vacío cuando no hay duplicados', () => {
    const rows = [
      { Nombre: 'Juan', Apellido: 'García', 'Código': 'CAM001' },
      { Nombre: 'Ana', Apellido: 'López', 'Código': 'CAM002' },
    ];
    const existing = [{ nombre: 'Pedro', apellido: 'Martínez', codigo: 'CAM003' }];
    expect(detectDuplicates(rows, existing)).toHaveLength(0);
  });

  it('debe ser insensible a mayúsculas/minúsculas para nombre y apellido', () => {
    const rows = [
      { Nombre: 'JUAN', Apellido: 'GARCÍA' },
      { Nombre: 'juan', Apellido: 'garcía' }, // mismo nombre en distinto case
    ];
    const conflicts = detectDuplicates(rows, []);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
