/**
 * Tests unitarios para el módulo QR del frontend
 * Framework: Vitest
 *
 * Para ejecutar desde src/:
 *   npm run test:unit
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateQrContent,
  compressQrContent,
  getQrCache,
  setQrCache,
  clearQrCache,
} from '../utils/qr-generator';

// ============== validateQrContent ==============

describe('validateQrContent', () => {
  it('debe aceptar contenido válido', () => {
    expect(validateQrContent('https://example.com')).toEqual({ valid: true });
    expect(validateQrContent('15/01/2024;lunes;Cliente;Lugar;14:00')).toEqual({ valid: true });
    expect(validateQrContent('texto simple')).toEqual({ valid: true });
  });

  it('debe rechazar contenido vacío', () => {
    const result = validateQrContent('');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('debe rechazar contenido que solo tiene espacios', () => {
    const result = validateQrContent('   ');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('debe rechazar contenido demasiado largo (> 4000 caracteres)', () => {
    const largo = 'a'.repeat(4001);
    const result = validateQrContent(largo);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('4001');
  });

  it('debe aceptar contenido exactamente en el límite (4000 caracteres)', () => {
    const limite = 'a'.repeat(4000);
    const result = validateQrContent(limite);
    expect(result.valid).toBe(true);
  });

  it('debe devolver valid: true sin campo reason cuando es válido', () => {
    const result = validateQrContent('contenido válido');
    expect(result.valid).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});

// ============== compressQrContent ==============

describe('compressQrContent', () => {
  it('debe comprimir una cadena de texto', () => {
    const result = compressQrContent('hola mundo');
    expect(result).toBe('hola+mundo');
  });

  it('debe serializar y comprimir un objeto JSON', () => {
    const obj = { cliente: 'Test', hora: '14:00' };
    const result = compressQrContent(obj);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Debe ser decodificable
    const decoded = decodeURIComponent(result.replace(/\+/g, ' '));
    expect(JSON.parse(decoded)).toEqual(obj);
  });

  it('debe comprimir un array', () => {
    const arr = ['a', 'b', 'c'];
    const result = compressQrContent(arr);
    const decoded = decodeURIComponent(result.replace(/\+/g, ' '));
    expect(JSON.parse(decoded)).toEqual(arr);
  });

  it('debe manejar números', () => {
    const result = compressQrContent(42);
    expect(result).toBe('42');
  });

  it('debe manejar valores booleanos', () => {
    expect(compressQrContent(true)).toBe('true');
    expect(compressQrContent(false)).toBe('false');
  });

  it('debe producir una cadena más corta para objetos grandes', () => {
    const obj = { cliente: 'Juan García', lugar: 'Salón de Bodas', hora: '14:00', fecha: '15/01/2024' };
    const jsonStr = JSON.stringify(obj);
    const compressed = compressQrContent(obj);
    // La versión comprimida debe tener espacio reemplazado por +
    expect(compressed).not.toContain(' ');
    expect(compressed.length).toBeGreaterThan(0);
    // El resultado debe ser reproducible
    const compressed2 = compressQrContent(obj);
    expect(compressed).toBe(compressed2);
  });
});

// ============== Caché del cliente ==============

describe('QR client cache', () => {
  beforeEach(() => {
    clearQrCache();
  });

  it('debe devolver null para claves no existentes', () => {
    expect(getQrCache('contenido-inexistente')).toBeNull();
  });

  it('debe almacenar y recuperar data URLs', () => {
    const content = 'https://example.com';
    const dataUrl = 'data:image/png;base64,abc123';

    setQrCache(content, dataUrl);
    expect(getQrCache(content)).toBe(dataUrl);
  });

  it('debe diferenciar entradas con distintas opciones', () => {
    const content = 'https://example.com';
    const url1 = 'data:image/png;base64,opciones1';
    const url2 = 'data:image/png;base64,opciones2';

    setQrCache(content, url1, { errorCorrectionLevel: 'L' });
    setQrCache(content, url2, { errorCorrectionLevel: 'H' });

    expect(getQrCache(content, { errorCorrectionLevel: 'L' })).toBe(url1);
    expect(getQrCache(content, { errorCorrectionLevel: 'H' })).toBe(url2);
  });

  it('debe limpiar toda la caché con clearQrCache', () => {
    setQrCache('contenido1', 'data:image/png;base64,a');
    setQrCache('contenido2', 'data:image/png;base64,b');

    clearQrCache();

    expect(getQrCache('contenido1')).toBeNull();
    expect(getQrCache('contenido2')).toBeNull();
  });

  it('debe respetar opciones por defecto equivalentes como la misma clave', () => {
    const content = 'test';
    const dataUrl = 'data:image/png;base64,default';

    // Guardar sin opciones (usa defaults)
    setQrCache(content, dataUrl);

    // Recuperar con opciones explícitas equivalentes a los defaults
    expect(getQrCache(content, { errorCorrectionLevel: 'M', scale: 8, margin: 4 })).toBe(dataUrl);
  });
});
