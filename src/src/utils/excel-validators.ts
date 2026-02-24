/**
 * Validadores para importación de datos desde Excel
 * Sistema de Gestión de Camareros
 */

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  reason: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 1000;
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

export class ExcelValidator {
  /**
   * Valida el archivo antes de procesarlo
   */
  static validateFile(file: File): string[] {
    const errors: string[] = [];

    if (file.size > MAX_FILE_SIZE) {
      errors.push('Archivo muy grande (máximo 5MB)');
    }

    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type);
    const hasValidExt = ALLOWED_EXTENSIONS.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );
    if (!hasValidMime && !hasValidExt) {
      errors.push('Tipo de archivo no válido. Use .xlsx, .xls o .csv');
    }

    return errors;
  }

  /**
   * Valida el número máximo de filas permitidas
   */
  static validateRowCount(count: number): string | null {
    if (count > MAX_ROWS) {
      return `Demasiadas filas (máximo ${MAX_ROWS}, encontradas ${count})`;
    }
    return null;
  }

  /**
   * Valida una fila individual del Excel
   */
  static validateRow(row: any, rowNum: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar nombre (requerido)
    if (
      !row['Nombre'] ||
      typeof row['Nombre'] !== 'string' ||
      row['Nombre'].trim().length === 0
    ) {
      errors.push({
        row: rowNum,
        field: 'Nombre',
        value: row['Nombre'],
        reason: 'Nombre es requerido y debe ser texto',
      });
    }

    // Validar apellido (requerido)
    if (
      !row['Apellido'] ||
      typeof row['Apellido'] !== 'string' ||
      row['Apellido'].trim().length === 0
    ) {
      errors.push({
        row: rowNum,
        field: 'Apellido',
        value: row['Apellido'],
        reason: 'Apellido es requerido y debe ser texto',
      });
    }

    // Validar teléfono (opcional)
    if (row['Teléfono'] !== undefined && row['Teléfono'] !== '') {
      const phone = row['Teléfono'].toString().trim();
      if (phone.length > 0 && !/^[\d\s\-\+\(\)]{8,20}$/.test(phone)) {
        errors.push({
          row: rowNum,
          field: 'Teléfono',
          value: phone,
          reason:
            'Formato de teléfono inválido (8-20 caracteres, números/espacios/-/+)',
        });
      }
    }

    // Validar email (opcional)
    if (row['Email'] !== undefined && row['Email'] !== '') {
      const email = row['Email'].toString().trim().toLowerCase();
      if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({
          row: rowNum,
          field: 'Email',
          value: row['Email'],
          reason: 'Formato de email inválido',
        });
      }
    }

    // Validar código (opcional)
    if (row['Código'] !== undefined && row['Código'] !== '') {
      const codigo = row['Código'].toString().trim();
      if (codigo.length > 0 && !/^[A-Za-z0-9\-]{2,10}$/.test(codigo)) {
        errors.push({
          row: rowNum,
          field: 'Código',
          value: row['Código'],
          reason:
            'Formato de código inválido (2-10 caracteres, letras/números/guion)',
        });
      }
    }

    return errors;
  }
}
