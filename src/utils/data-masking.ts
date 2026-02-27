/**
 * Utilidades para enmascarar datos sensibles en logs
 *
 * Evita que teléfonos, tokens y otros datos sensibles
 * queden expuestos en los logs de la aplicación.
 */

/** Enmascara un número de teléfono dejando solo los últimos 2 dígitos */
function maskPhone(value: string): string {
  return `***-**${value.slice(-2)}`;
}

/** Enmascara un token largo dejando solo los primeros 4 caracteres */
function maskToken(value: string): string {
  return `${value.slice(0, 4)}***`;
}

/**
 * Enmascara un valor sensible según su tipo:
 * - Teléfonos: `***-**XX`
 * - Tokens/claves largas (≥ 20 caracteres alfanuméricos): `XXXX***`
 * - Objetos y arrays: procesados recursivamente
 * - Otros valores: sin cambios
 */
export function maskSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    if (/^\+?[0-9]{7,15}$/.test(data)) {
      return maskPhone(data);
    }
    if (/^[A-Za-z0-9_\-]{20,}$/.test(data)) {
      return maskToken(data);
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  if (data !== null && typeof data === 'object') {
    const SENSITIVE_KEYS = new Set([
      'password', 'token', 'secret', 'apiKey', 'api_key',
      'authorization', 'telefono', 'phone', 'email',
    ]);
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEYS.has(key.toLowerCase())
        ? '***'
        : maskSensitiveData(value);
    }
    return result;
  }

  return data;
}
