/**
 * Normalización de datos para importación desde Excel
 * Sistema de Gestión de Camareros
 */

/**
 * Capitaliza la primera letra y pone el resto en minúsculas
 */
function capitalizarPalabra(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Normaliza una fila del Excel convirtiéndola en un objeto camarero parcial
 */
export function normalizeRow(row: any): Record<string, any> {
  return {
    nombre: row['Nombre']
      ? capitalizarPalabra(row['Nombre'].toString().trim())
      : '',
    apellido: row['Apellido']
      ? row['Apellido'].toString().trim().toUpperCase()
      : '',
    codigo: row['Código']
      ? row['Código'].toString().trim().toUpperCase()
      : '',
    tipoPerfil: row['Tipo Perfil']
      ? row['Tipo Perfil'].toString().trim().toUpperCase()
      : 'CAM',
    telefono: row['Teléfono']
      ? row['Teléfono'].toString().replace(/\s/g, '')
      : '',
    email: row['Email']
      ? row['Email'].toString().toLowerCase().trim()
      : '',
    especialidades: row['Especialidades']
      ? row['Especialidades']
          .toString()
          .split(',')
          .map((e: string) => e.trim())
          .filter(Boolean)
      : [],
    experiencia: row['Experiencia (años)']
      ? row['Experiencia (años)'].toString().trim()
      : '',
    idiomas: row['Idiomas']
      ? row['Idiomas']
          .toString()
          .split(',')
          .map((i: string) => i.trim())
          .filter(Boolean)
      : [],
    otrosIdiomas: row['Otros Idiomas']
      ? row['Otros Idiomas'].toString().trim()
      : '',
    certificaciones: row['Certificaciones']
      ? row['Certificaciones']
          .toString()
          .split(',')
          .map((c: string) => c.trim())
          .filter(Boolean)
      : [],
    otrasCertificaciones: row['Otras Certificaciones']
      ? row['Otras Certificaciones'].toString().trim()
      : '',
    coordinadorId: row['Coordinador ID']
      ? row['Coordinador ID'].toString().trim()
      : '',
    comentarios: row['Comentarios']
      ? row['Comentarios'].toString().trim()
      : '',
    estado: row['Estado']
      ? row['Estado'].toString().trim().toLowerCase()
      : 'activo',
    disponibilidad: [],
  };
}
