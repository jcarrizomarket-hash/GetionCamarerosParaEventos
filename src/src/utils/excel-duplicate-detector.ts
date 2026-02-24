/**
 * Detección de duplicados para importación desde Excel
 * Sistema de Gestión de Camareros
 */

export interface DuplicateConflict {
  row1: number;
  row2: number;
  reason: string;
}

/**
 * Genera una clave de identidad para detectar duplicados por nombre+apellido
 */
function identityKey(nombre: string, apellido: string): string {
  return `${nombre.trim().toLowerCase()}|${apellido.trim().toLowerCase()}`;
}

/**
 * Detecta duplicados dentro del mismo archivo y contra los datos existentes
 */
export function detectDuplicates(
  rows: any[],
  existing: any[]
): DuplicateConflict[] {
  const conflicts: DuplicateConflict[] = [];

  // Detectar duplicados internos (dentro del mismo archivo)
  const seen = new Map<string, number>(); // key -> first row number (1-based offset starting at 2)
  const seenCodigos = new Map<string, number>();

  rows.forEach((row, index) => {
    const rowNum = index + 2; // +2 for header row and 0-based offset
    const nombre = (row['Nombre'] || '').toString().trim();
    const apellido = (row['Apellido'] || '').toString().trim();
    const codigo = (row['Código'] || '').toString().trim().toUpperCase();

    if (nombre && apellido) {
      const key = identityKey(nombre, apellido);
      if (seen.has(key)) {
        conflicts.push({
          row1: seen.get(key)!,
          row2: rowNum,
          reason: `Mismo nombre y apellido: ${nombre} ${apellido}`,
        });
      } else {
        seen.set(key, rowNum);
      }
    }

    if (codigo) {
      if (seenCodigos.has(codigo)) {
        conflicts.push({
          row1: seenCodigos.get(codigo)!,
          row2: rowNum,
          reason: `Código duplicado en el archivo: ${codigo}`,
        });
      } else {
        seenCodigos.set(codigo, rowNum);
      }
    }
  });

  // Detectar duplicados contra datos existentes
  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const nombre = (row['Nombre'] || '').toString().trim();
    const apellido = (row['Apellido'] || '').toString().trim();
    const codigo = (row['Código'] || '').toString().trim().toUpperCase();

    if (nombre && apellido) {
      const key = identityKey(nombre, apellido);
      const existingMatch = existing.find(
        c =>
          identityKey(c.nombre || '', c.apellido || '') === key
      );
      if (existingMatch) {
        conflicts.push({
          row1: 0, // 0 indicates existing record
          row2: rowNum,
          reason: `Ya existe en el sistema: ${nombre} ${apellido}`,
        });
      }
    }

    if (codigo) {
      const existingCodigo = existing.find(
        c => (c.codigo || '').toString().toUpperCase() === codigo
      );
      if (existingCodigo) {
        conflicts.push({
          row1: 0,
          row2: rowNum,
          reason: `Código ya existe en el sistema: ${codigo}`,
        });
      }
    }
  });

  return conflicts;
}
