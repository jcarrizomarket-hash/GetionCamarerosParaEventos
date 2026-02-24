import { useState } from 'react';
import { ValidationError } from '../src/utils/excel-validators';
import { DuplicateConflict } from '../src/utils/excel-duplicate-detector';

interface ExcelImportPreviewProps {
  validRows: any[];
  invalidRows: Array<{ row: number; errors: ValidationError[] }>;
  duplicates: DuplicateConflict[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ExcelImportPreview({
  validRows,
  invalidRows,
  duplicates,
  onConfirm,
  onCancel,
}: ExcelImportPreviewProps) {
  const [importing, setImporting] = useState(false);

  const handleConfirm = async () => {
    setImporting(true);
    try {
      await onConfirm();
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Preview de Importación
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Revisa los datos antes de confirmar la importación
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {validRows.length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Registros válidos</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {invalidRows.length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Errores</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {duplicates.length}
              </div>
              <p className="text-xs text-gray-600 mt-1">Duplicados</p>
            </div>
          </div>

          {/* Validation errors */}
          {invalidRows.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-600 mb-2 text-sm">
                Errores encontrados (filas con errores serán omitidas):
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                {invalidRows.map(({ row, errors }) => (
                  <div key={row} className="text-sm mb-2">
                    <p className="font-medium text-red-700">Fila {row}:</p>
                    <ul className="list-disc list-inside text-red-600 ml-2">
                      {errors.map((err, i) => (
                        <li key={i}>
                          <span className="font-medium">{err.field}</span>:{' '}
                          {err.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicates */}
          {duplicates.length > 0 && (
            <div>
              <h3 className="font-semibold text-orange-600 mb-2 text-sm">
                Duplicados detectados (serán omitidos):
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                {duplicates.map((dup, i) => (
                  <div key={i} className="text-sm mb-1 text-orange-700">
                    {dup.row1 === 0
                      ? `Fila ${dup.row2}: ${dup.reason}`
                      : `Filas ${dup.row1} y ${dup.row2}: ${dup.reason}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No valid rows */}
          {validRows.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center text-yellow-700 text-sm">
              No hay registros válidos para importar.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={importing}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={validRows.length === 0 || importing}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {importing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importando...
              </>
            ) : (
              `Importar ${validRows.length} registro${validRows.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
