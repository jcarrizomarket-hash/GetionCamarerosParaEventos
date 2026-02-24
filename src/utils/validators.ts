/**
 * Validators reutilizables para validación de entradas de usuario y datos de API.
 */

export const validators = {
  email: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  phone: (phone: string): boolean => {
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return re.test(phone);
  },

  nombre: (nombre: string): boolean => {
    return nombre.length >= 2 && nombre.length <= 100;
  },

  codigo: (codigo: string): boolean => {
    return codigo.length >= 2 && /^[A-Z0-9-]+$/.test(codigo);
  },

  fecha: (fecha: string): boolean => {
    const date = new Date(fecha);
    return !isNaN(date.getTime()) && date > new Date();
  },
};

export function validarCamarero(data: Record<string, string>) {
  const errors: Record<string, string> = {};

  if (!validators.nombre(data.nombre ?? '')) {
    errors.nombre = 'Nombre inválido';
  }
  if (!validators.email(data.email ?? '')) {
    errors.email = 'Email inválido';
  }
  if (!validators.phone(data.telefono ?? '')) {
    errors.telefono = 'Teléfono inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validarCoordinador(data: Record<string, string>) {
  const errors: Record<string, string> = {};

  if (!validators.nombre(data.nombre ?? '')) {
    errors.nombre = 'Nombre inválido';
  }
  if (data.email && !validators.email(data.email)) {
    errors.email = 'Email inválido';
  }
  if (data.telefono && !validators.phone(data.telefono)) {
    errors.telefono = 'Teléfono inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validarCliente(data: Record<string, string>) {
  const errors: Record<string, string> = {};

  if (!validators.nombre(data.nombre ?? '')) {
    errors.nombre = 'Nombre inválido';
  }
  if (data.email && !validators.email(data.email)) {
    errors.email = 'Email inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
