/**
 * Validadores reutilizables para el sistema de gestión de camareros
 */

/**
 * Valida formato de email
 */
export function validarEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'El email no puede estar vacío' };
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' };
  }
  return { valid: true };
}

/**
 * Valida formato de teléfono (español e internacional)
 */
export function validarTelefono(tel: string): { valid: boolean; error?: string } {
  if (!tel || tel.trim() === '') {
    return { valid: false, error: 'El teléfono no puede estar vacío' };
  }
  // Limpiar el número
  const numeroLimpio = tel.replace(/[\s\-\(\)\.]/g, '');
  // Aceptar formato con + y código de país, o formato local español (9 dígitos)
  const regexInternacional = /^\+?\d{9,15}$/;
  if (!regexInternacional.test(numeroLimpio)) {
    return { valid: false, error: 'Formato de teléfono inválido' };
  }
  return { valid: true };
}

/**
 * Valida formato de fecha (YYYY-MM-DD)
 */
export function validarFecha(fecha: string): { valid: boolean; error?: string } {
  if (!fecha || fecha.trim() === '') {
    return { valid: false, error: 'La fecha no puede estar vacía' };
  }
  const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexFecha.test(fecha)) {
    return { valid: false, error: 'Formato de fecha inválido. Use YYYY-MM-DD' };
  }
  const fechaObj = new Date(fecha);
  if (isNaN(fechaObj.getTime())) {
    return { valid: false, error: 'Fecha no válida' };
  }
  const [year, month, day] = fecha.split('-').map(Number);
  if (
    fechaObj.getFullYear() !== year ||
    fechaObj.getMonth() + 1 !== month ||
    fechaObj.getDate() !== day
  ) {
    return { valid: false, error: 'Fecha no válida' };
  }
  return { valid: true };
}

/**
 * Valida número de pedido (formato alfanumérico con guiones)
 */
export function validarNumeroPedido(numero: string): { valid: boolean; error?: string } {
  if (!numero || numero.trim() === '') {
    return { valid: false, error: 'El número de pedido no puede estar vacío' };
  }
  const regex = /^[A-Z0-9][A-Z0-9\-]{1,19}$/i;
  if (!regex.test(numero.trim())) {
    return { valid: false, error: 'Formato de número de pedido inválido' };
  }
  return { valid: true };
}
