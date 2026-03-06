import { logger } from '../../utils/logger';
import ExcelJS from 'exceljs';

// xlsx (v0.18.5) fue removido por CVEs conocidos (Prototype Pollution, ReDoS).
// Reemplazado por exceljs que ya era dependencia del proyecto.

export async function exportarAExcel(camareros: any[], showToast: (msg: string, type: 'success' | 'error') => void): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Personal');

    worksheet.columns = [
      { header: 'Código', key: 'codigo', width: 12 },
      { header: 'Tipo Perfil', key: 'tipoPerfil', width: 14 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Apellido', key: 'apellido', width: 20 },
      { header: 'Teléfono', key: 'telefono', width: 16 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Especialidades', key: 'especialidades', width: 28 },
      { header: 'Experiencia (años)', key: 'experiencia', width: 18 },
      { header: 'Idiomas', key: 'idiomas', width: 20 },
      { header: 'Otros Idiomas', key: 'otrosIdiomas', width: 18 },
      { header: 'Certificaciones', key: 'certificaciones', width: 24 },
      { header: 'Otras Certificaciones', key: 'otrasCertificaciones', width: 24 },
      { header: 'Coordinador ID', key: 'coordinadorId', width: 16 },
      { header: 'Comentarios', key: 'comentarios', width: 30 },
      { header: 'Estado', key: 'estado', width: 12 },
    ];

    camareros.forEach(cam => {
      worksheet.addRow({
        codigo: cam.codigo || '',
        tipoPerfil: cam.tipoPerfil || 'CAM',
        nombre: cam.nombre,
        apellido: cam.apellido,
        telefono: cam.telefono || '',
        email: cam.email || '',
        especialidades: Array.isArray(cam.especialidades) ? cam.especialidades.join(', ') : '',
        experiencia: cam.experiencia || '',
        idiomas: Array.isArray(cam.idiomas) ? cam.idiomas.join(', ') : '',
        otrosIdiomas: cam.otrosIdiomas || '',
        certificaciones: Array.isArray(cam.certificaciones) ? cam.certificaciones.join(', ') : '',
        otrasCertificaciones: cam.otrasCertificaciones || '',
        coordinadorId: cam.coordinadorId || '',
        comentarios: cam.comentarios || '',
        estado: cam.estado || 'activo',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `Personal_${fecha}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Datos exportados correctamente', 'success');
  } catch (error) {
    logger.error('Error al exportar:', error);
    showToast('Error al exportar datos', 'error');
  }
}

export async function importarDesdeExcel(
  event: any,
  camareros: any[],
  baseUrl: string,
  publicAnonKey: string,
  cargarDatos: () => Promise<void>,
  showToast: (msg: string, type: 'success' | 'error' | 'warning') => void,
  showConfirm: (msg: string) => Promise<boolean>
): Promise<void> {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const data = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);
    const worksheet = workbook.worksheets[0];

    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell) => { headers.push(String(cell.value ?? '')); });

    const jsonData: Record<string, any>[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const rowObj: Record<string, any> = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) rowObj[header] = cell.value;
      });
      if (Object.keys(rowObj).length > 0) jsonData.push(rowObj);
    });

    if (jsonData.length === 0) { showToast('El archivo está vacío', 'error'); return; }
    const confirmed = await showConfirm(`¿Deseas importar ${jsonData.length} registros?\n\nEsto creará nuevos camareros. Los códigos duplicados serán ignorados.`);
    if (!confirmed) return;

    let importados = 0;
    let errores = 0;

    for (const row of jsonData) {
      try {
        if (!row['Nombre'] || !row['Apellido']) {
          logger.warn('Fila sin nombre/apellido, omitida:', row);
          errores++;
          continue;
        }
        const codigoExistente = camareros.find(c => c.codigo === row['Código']);
        if (codigoExistente) {
          logger.warn('Código duplicado, omitido:', row['Código']);
          errores++;
          continue;
        }
        const nuevoCamarero = {
          codigo: row['Código'] || '',
          tipoPerfil: row['Tipo Perfil'] || 'CAM',
          nombre: row['Nombre'],
          apellido: row['Apellido'],
          telefono: row['Teléfono'] || '',
          email: row['Email'] || '',
          especialidades: row['Especialidades'] ? row['Especialidades'].split(',').map((e: string) => e.trim()) : [],
          experiencia: row['Experiencia (años)'] || '',
          idiomas: row['Idiomas'] ? row['Idiomas'].split(',').map((i: string) => i.trim()) : [],
          otrosIdiomas: row['Otros Idiomas'] || '',
          certificaciones: row['Certificaciones'] ? row['Certificaciones'].split(',').map((c: string) => c.trim()) : [],
          otrasCertificaciones: row['Otras Certificaciones'] || '',
          coordinadorId: row['Coordinador ID'] || '',
          comentarios: row['Comentarios'] || '',
          estado: row['Estado'] || 'activo',
          disponibilidad: []
        };
        const response = await fetch(`${baseUrl}/camareros`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify(nuevoCamarero)
        });
        if (response.ok) importados++; else errores++;
      } catch (error) {
        logger.error('Error al importar fila:', error);
        errores++;
      }
    }

    await cargarDatos();
    showToast(`Importación completada — Importados: ${importados}, Errores/Omitidos: ${errores}`, 'success');
    event.target.value = '';
  } catch (error) {
    logger.error('Error al procesar archivo:', error);
    showToast('Error al procesar el archivo Excel', 'error');
  }
}
