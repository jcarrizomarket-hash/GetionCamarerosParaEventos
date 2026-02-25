/**
 * Módulo de generación de QR para backend (Deno/Supabase Functions)
 * 
 * Extrae y centraliza toda la lógica de generación de códigos QR.
 * Proporciona: PNG puro, base64, data URLs, validación, caché y compresión.
 */

import QRCode from 'npm:qrcode';

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

// ============== CACHÉ INTERNA ==============

const _qrCache = new Map<string, QrOutput>();

/** Genera la clave de caché para un contenido y opciones */
function _cacheKey(content: string, opts: Required<Omit<QrOptions, 'useCache'>>): string {
  return `${content}|${opts.errorCorrectionLevel}|${opts.scale}|${opts.margin}`;
}

// ============== HELPERS PNG ==============

function _crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function _u32be(n: number): number[] {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function _concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function _buildPngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const lenBytes = new Uint8Array(_u32be(data.length));
  const crcInput = _concatUint8Arrays([typeBytes, data]);
  const crcBytes = new Uint8Array(_u32be(_crc32(crcInput)));
  return _concatUint8Arrays([lenBytes, typeBytes, data, crcBytes]);
}

/** Construye los bytes PNG en crudo a partir de los módulos del QR */
async function _buildPngBytes(
  modules: { size: number; get: (row: number, col: number) => boolean },
  scale: number,
  margin: number,
): Promise<{ png: Uint8Array; totalSize: number }> {
  const size: number = modules.size;
  const totalSize = (size + 2 * margin) * scale;

  // Scanlines sin filtro (byte 0 = None) + píxeles en escala de grises
  const raw = new Uint8Array(totalSize * (1 + totalSize));
  let idx = 0;
  for (let y = 0; y < totalSize; y++) {
    raw[idx++] = 0; // filtro None
    const qrY = Math.floor(y / scale) - margin;
    for (let x = 0; x < totalSize; x++) {
      const qrX = Math.floor(x / scale) - margin;
      const isBlack = qrX >= 0 && qrX < size && qrY >= 0 && qrY < size && modules.get(qrY, qrX);
      raw[idx++] = isBlack ? 0 : 255;
    }
  }

  // Comprimir con zlib (deflate = formato requerido por PNG)
  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  await writer.write(raw);
  await writer.close();

  const compressedChunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) compressedChunks.push(value);
  }
  const compressed = _concatUint8Arrays(compressedChunks);

  // Firma PNG
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: ancho, alto, profundidad (8), tipo de color (0 = escala de grises)
  const ihdrData = new Uint8Array([
    ..._u32be(totalSize), ..._u32be(totalSize),
    8, 0, 0, 0, 0,
  ]);

  const ihdr = _buildPngChunk('IHDR', ihdrData);
  const idat = _buildPngChunk('IDAT', compressed);
  const iend = _buildPngChunk('IEND', new Uint8Array(0));

  return { png: _concatUint8Arrays([signature, ihdr, idat, iend]), totalSize };
}

// ============== API PÚBLICA ==============

/**
 * Genera un código QR a partir de un contenido de texto.
 *
 * @param content - Texto o URL a codificar en el QR
 * @param options - Opciones de generación (nivel de error, escala, margen, caché)
 * @returns QrOutput con png, base64, dataUrl, dimensiones y fecha de generación
 */
export async function generateQrPng(content: string, options?: QrOptions): Promise<QrOutput> {
  const opts = {
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    scale: options?.scale ?? 8,
    margin: options?.margin ?? 4,
    useCache: options?.useCache ?? true,
  };

  const key = _cacheKey(content, opts);

  if (opts.useCache) {
    const cached = _qrCache.get(key);
    if (cached) {
      console.log(`[QR] Caché hit: "${content.substring(0, 40)}..."`);
      return cached;
    }
  }

  console.log(`[QR] Generando QR para: "${content.substring(0, 40)}..." (ECL=${opts.errorCorrectionLevel})`);

  const qr = QRCode.create(content, { errorCorrectionLevel: opts.errorCorrectionLevel });
  const modules = qr.modules;

  const { png, totalSize } = await _buildPngBytes(modules, opts.scale, opts.margin);

  // Codificar en base64
  let binaryStr = '';
  for (let i = 0; i < png.length; i++) {
    binaryStr += String.fromCharCode(png[i]);
  }
  const base64 = btoa(binaryStr);
  const dataUrl = `data:image/png;base64,${base64}`;

  const output: QrOutput = {
    png,
    base64,
    dataUrl,
    dimensions: { width: totalSize, height: totalSize },
    generatedAt: new Date(),
  };

  if (opts.useCache) {
    _qrCache.set(key, output);
    console.log(`[QR] Guardado en caché: "${key.substring(0, 50)}"`);
  }

  return output;
}

/**
 * Valida que el contenido sea apto para codificar en un QR.
 *
 * @param content - Texto a validar
 * @returns Resultado de validación con campo 'valid' y 'reason' en caso de error
 */
export function validateQrContent(content: string): QrValidationResult {
  if (!content || content.trim().length === 0) {
    return { valid: false, reason: 'El contenido no puede estar vacío' };
  }

  // QR puede almacenar hasta ~7089 caracteres numéricos o ~4296 alfanuméricos
  if (content.length > 4000) {
    return { valid: false, reason: `El contenido es demasiado largo (${content.length} caracteres, máximo 4000)` };
  }

  return { valid: true };
}

/**
 * Obtiene un resultado QR de la caché interna.
 *
 * @param content - Contenido del QR original
 * @param options - Mismas opciones con las que se generó
 * @returns QrOutput si existe en caché, o null si no
 */
export function getQrCache(content: string, options?: QrOptions): QrOutput | null {
  const opts = {
    errorCorrectionLevel: options?.errorCorrectionLevel ?? 'M',
    scale: options?.scale ?? 8,
    margin: options?.margin ?? 4,
  };
  const key = _cacheKey(content, opts);
  return _qrCache.get(key) ?? null;
}

/**
 * Limpia toda la caché de QR generados.
 */
export function clearQrCache(): void {
  const count = _qrCache.size;
  _qrCache.clear();
  console.log(`[QR] Caché limpiada (${count} entradas eliminadas)`);
}

/**
 * Comprime datos estructurados (JSON, CSV, etc.) en una cadena compacta
 * para reducir el tamaño del QR resultante.
 *
 * @param data - Objeto, array o primitivo a comprimir
 * @returns Cadena comprimida codificada en URI
 */
export function compressQrContent(data: unknown): string {
  let str: string;
  if (typeof data === 'string') {
    str = data;
  } else {
    str = JSON.stringify(data);
  }
  // Codificación URI compacta: elimina espacios y caracteres redundantes
  return encodeURIComponent(str).replace(/%20/g, '+');
}
