import { useCallback } from 'react';

type PdfExportFn = (doc: import('jspdf').jsPDF) => void;

/**
 * Lazy-loads jsPDF on demand so the PDF chunk is excluded from the initial
 * bundle. Call `exportPDF` with a callback that receives the jsPDF instance.
 *
 * Importing 'jspdf-autotable' as a side-effect extends the jsPDF prototype
 * with `doc.autoTable(...)`, making it available inside the builder callback.
 */
export function useLazyPDF() {
  const exportPDF = useCallback(async (builder: PdfExportFn, filename: string) => {
    // Side-effect import of jspdf-autotable extends jsPDF.prototype with autoTable
    await import('jspdf-autotable');
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF();
    builder(doc);
    doc.save(filename);
  }, []);

  return { exportPDF };
}
