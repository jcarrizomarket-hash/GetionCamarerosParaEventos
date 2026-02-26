/**
 * Seguridad para webhooks de WhatsApp
 * Valida la firma HMAC-SHA256 para verificar autenticidad de los mensajes
 */

import type { Context } from 'npm:hono';

/**
 * Verifica la firma del webhook de WhatsApp Meta
 * 
 * WhatsApp envía el header 'x-hub-signature-256' con el HMAC-SHA256
 * del cuerpo del request, firmado con el App Secret de Meta.
 *
 * Referencia: https://developers.facebook.com/docs/messenger-platform/webhooks#validate-payloads
 */
export async function verifyWhatsAppWebhookSignature(
  c: Context,
  rawBody: string
): Promise<boolean> {
  const appSecret = Deno.env.get('WHATSAPP_APP_SECRET');

  if (!appSecret) {
    console.warn('⚠️ WHATSAPP_APP_SECRET no configurado. Validación de firma omitida.');
    return true;
  }

  const signature = c.req.header('x-hub-signature-256');

  if (!signature) {
    console.warn('❌ Webhook sin header x-hub-signature-256');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(appSecret);
    const messageData = encoder.encode(rawBody);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return timingSafeEqual(signature, expectedSignature);
  } catch (error) {
    console.error('❌ Error al verificar firma del webhook:', error);
    return false;
  }
}

/**
 * Comparación de strings a tiempo constante para evitar timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Valida el token de verificación del webhook de WhatsApp
 * Usado cuando Meta verifica el endpoint por primera vez (GET request)
 */
export function verifyWhatsAppWebhookToken(
  c: Context
): { valid: boolean; challenge?: string } {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const expectedToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

  if (!expectedToken) {
    console.warn('⚠️ WHATSAPP_VERIFY_TOKEN no configurado.');
    return { valid: false };
  }

  if (mode === 'subscribe' && token === expectedToken) {
    return { valid: true, challenge: challenge ?? '' };
  }

  console.warn(`❌ Token de verificación inválido. Recibido: ${token}`);
  return { valid: false };
}

/**
 * Middleware para proteger el endpoint del webhook de WhatsApp (POST)
 * Almacena el cuerpo en el contexto para que los handlers posteriores puedan accederlo
 */
export async function requireWhatsAppWebhookSignature(
  c: Context,
  next: () => Promise<void>
) {
  if (c.req.method !== 'POST') {
    return next();
  }

  const rawBody = await c.req.text();
  const isValid = await verifyWhatsAppWebhookSignature(c, rawBody);

  if (!isValid) {
    return c.json({ success: false, error: 'Firma de webhook inválida' }, 401);
  }

  // Preservar el cuerpo en el contexto para el handler posterior
  c.set('rawBody', rawBody);

  return next();
}
