/**
 * Módulo de utilidades QR para el frontend (React/Vite/Node)
 *
 * Proporciona tipos compartidos, validación pura, compresión de contenido
 * y gestión de caché de data URLs para la visualización y descarga de QR.
 */

// ============== TIPOS EXPORTADOS ==============

/** Opciones de configuración para la generación de QR */
export interface QrOptions {
  /** Nivel de corrección de errores (default: 'M') */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Píxeles por módulo del QR (default: 8) */
  scale?: number;
  /** Módulos de margen alrededor del QR (default: 4) */
  margin?: number;
  /** Si se debe usar la caché (default: true) */
  useCache?: boolean;
}

/** Resultado completo de la generación de un QR */
export interface QrOutput {
  /** Bytes PNG en crudo */
  png: Uint8Array;
  /** Cadena base64 del PNG */
  base64: string;
  /** Data URL lista para usar en <img src="..."> */
  dataUrl: string;
  /** Dimensiones de la imagen generada */
  dimensions: { width: number; height: number };
  /** Fecha y hora de generación */
  generatedAt: Date;
}

/** Resultado de la validación de contenido QR */
export interface QrValidationResult {
  valid: boolean;
  reason?: string;
}

// ============== CACHÉ DEL LADO DEL CLIENTE ==============

/** Caché en memoria para data URLs de QR ya obtenidos del backend */
const _dataUrlCache = new Map<string, string>();

/** Genera la clave de caché para un contenido y opciones */
function _cacheKey(content: string, options?: QrOptions): string {
  const ecl = options?.errorCorrectionLevel ?? 'M';
  const scale = options?.scale ?? 8;
  const margin = options?.margin ?? 4;
  return `${content}|${ecl}|${scale}|${margin}`;
}

// ============== API PÚBLICA ==============

/**
 * Valida que el contenido sea apto para codificar en un QR.
 *
 * @param content - Texto a validar
 * @returns Resultado de validación con 'valid' y 'reason' en caso de error
 */
export function validateQrContent(content: string): QrValidationResult {
  if (!content || content.trim().length === 0) {
    return { valid: false, reason: 'El contenido no puede estar vacío' };
  }

  // QR puede almacenar hasta ~7089 caracteres numéricos o ~4296 alfanuméricos
  if (content.length > 4000) {
    return {
      valid: false,
      reason: `El contenido es demasiado largo (${content.length} caracteres, máximo 4000)`,
    };
  }

  return { valid: true };
}

/**
 * Comprime datos estructurados (JSON, objeto, array o primitivo) en una
 * cadena compacta, reduciendo el tamaño del QR resultante.
 *
 * @param data - Valor a comprimir
 * @returns Cadena comprimida codificada en URI
 */
export function compressQrContent(data: unknown): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return encodeURIComponent(str).replace(/%20/g, '+');
}

/**
 * Obtiene la data URL de un QR de la caché del cliente.
 *
 * @param content - Contenido original del QR
 * @param options - Opciones con las que fue generado
 * @returns Data URL si existe en caché, o null si no
 */
export function getQrCache(content: string, options?: QrOptions): string | null {
  const key = _cacheKey(content, options);
  return _dataUrlCache.get(key) ?? null;
}

/**
 * Almacena una data URL de QR en la caché del cliente.
 *
 * @param content - Contenido original del QR
 * @param dataUrl - Data URL a guardar
 * @param options - Opciones de generación
 */
export function setQrCache(content: string, dataUrl: string, options?: QrOptions): void {
  const key = _cacheKey(content, options);
  _dataUrlCache.set(key, dataUrl);
}

/**
 * Limpia toda la caché de QR del cliente.
 */
export function clearQrCache(): void {
  _dataUrlCache.clear();
}

/**
 * Obtiene la data URL de un QR llamando al endpoint del backend.
 * Usa la caché del cliente si está disponible.
 *
 * @param content - Texto a codificar en el QR
 * @param baseUrl - URL base del servidor (p. ej. "https://xxx.supabase.co/functions/v1/make-server-...")
 * @param authToken - Token de autorización (anon key de Supabase)
 * @param options - Opciones de generación
 * @returns Data URL del PNG del QR
 */
export async function fetchQrDataUrl(
  content: string,
  baseUrl: string,
  authToken: string,
  options?: QrOptions,
): Promise<string> {
  const validation = validateQrContent(content);
  if (!validation.valid) {
    throw new Error(`Contenido QR inválido: ${validation.reason}`);
  }

  const useCache = options?.useCache ?? true;

  if (useCache) {
    const cached = getQrCache(content, options);
    if (cached) {
      return cached;
    }
  }

  const res = await fetch(`${baseUrl}/generar-qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      content,
      errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
      scale: options?.scale ?? 8,
      margin: options?.margin ?? 4,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Error al generar QR (HTTP ${res.status})`);
  }

  const { dataUrl } = (await res.json()) as { dataUrl: string };

  if (useCache) {
    setQrCache(content, dataUrl, options);
  }

  return dataUrl;
}
