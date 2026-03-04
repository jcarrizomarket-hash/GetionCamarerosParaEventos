/**
 * Utilidades de exportación de archivos.
 * Funciones para exportar datos a CSV y JSON desde el browser.
 */

/**
 * Exporta un array de objetos a un archivo CSV y lo descarga en el browser.
 * El nombre del archivo resultante será `${filename}.csv` (la extensión se añade automáticamente).
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        const str = value === null || value === undefined ? '' : String(value);
        // Escapar comas y comillas
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Exporta un objeto o array a un archivo JSON y lo descarga en el browser.
 * El nombre del archivo resultante será `${filename}.json` (la extensión se añade automáticamente).
 */
export function exportToJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Helper interno: crea un link temporal y dispara la descarga.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
