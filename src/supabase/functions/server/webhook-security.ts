/**
 * Webhook signature validation utilities
 */

/**
 * Computes an HMAC-SHA256 signature for the given payload using the provided secret
 */
async function computeHmacSha256(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Performs a constant-time string comparison to prevent timing attacks
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface WebhookValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an incoming webhook request signature.
 * Expects the signature in the `x-webhook-signature` header as `sha256=<hex>`.
 *
 * @param body     - Raw request body string
 * @param signature - Value of the `x-webhook-signature` header
 * @param secret   - The shared webhook secret
 */
export async function validateWebhookSignature(
  body: string,
  signature: string | undefined | null,
  secret: string
): Promise<WebhookValidationResult> {
  if (!signature) {
    return { valid: false, error: 'Falta la firma del webhook (x-webhook-signature)' };
  }

  const prefix = 'sha256=';
  if (!signature.startsWith(prefix)) {
    return { valid: false, error: 'Formato de firma inválido. Se esperaba sha256=<hex>' };
  }

  const providedHex = signature.slice(prefix.length);

  try {
    const expectedHex = await computeHmacSha256(secret, body);
    const isValid = safeEqual(providedHex, expectedHex);

    if (!isValid) {
      return { valid: false, error: 'Firma del webhook inválida' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Error al verificar la firma del webhook' };
  }
}

/**
 * Generates a webhook signature for a given payload and secret.
 * Useful for testing or generating signatures to send to other services.
 */
export async function generateWebhookSignature(
  body: string,
  secret: string
): Promise<string> {
  const hex = await computeHmacSha256(secret, body);
  return `sha256=${hex}`;
}
