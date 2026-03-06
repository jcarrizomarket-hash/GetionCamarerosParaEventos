import { logger } from '../../utils/logger';
import * as XLSX from 'xlsx';

export function exportarAExcel(camareros: any[], showToast: (msg: string, type: 'success' | 'error') => void): void {
  try {
    const datosExportacion = camareros.map(cam => ({
      'Código': cam.codigo || '',
      'Tipo Perfil': cam.tipoPerfil || 'CAM',
      'Nombre': cam.nombre,
      'Apellido': cam.apellido,
      'Teléfono': cam.telefono || '',
      'Email': cam.email || '',
      'Especialidades': Array.isArray(cam.especialidades) ? cam.especialidades.join(', ') : '',
      'Experiencia (años)': cam.experiencia || '',
      'Idiomas': Array.isArray(cam.idiomas) ? cam.idiomas.join(', ') : '',
      'Otros Idiomas': cam.otrosIdiomas || '',
      'Certificaciones': Array.isArray(cam.certificaciones) ? cam.certificaciones.join(', ') : '',
      'Otras Certificaciones': cam.otrasCertificaciones || '',
      'Coordinador ID': cam.coordinadorId || '',
      'Comentarios': cam.comentarios || '',
      'Estado': cam.estado || 'activo'
    }));

    const ws = XLSX.utils.json_to_sheet(datosExportacion);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Personal');
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Personal_${fecha}.xlsx`);
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
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) { showToast('El archivo está vacío', 'error'); return; }
    const confirmed = await showConfirm(`¿Deseas importar ${jsonData.length} registros?\n\nEsto creará nuevos camareros. Los códigos duplicados serán ignorados.`);
    if (!confirmed) return;

    let importados = 0;
    let errores = 0;

    for (const row of jsonData as any[]) {
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
