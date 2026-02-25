import type { Context } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';
import * as kv from './kv_store.tsx';
const KV_TABLE = 'kv_store_25b11ac0';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  whitelist?: string[];
  softLimitPercent?: number; // e.g. 80 = warn at 80%
}

export interface RateLimitRecord {
  count: number;
  resetAt: number;
  violations: number;
  lastViolation?: number;
  version?: number; // used for optimistic concurrency control
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000,
  softLimitPercent: 80,
};

const TRUSTED_IPS = [
  '127.0.0.1',
  '::1',
];

function supabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

async function getOrCreateRecord(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitRecord> {
  const existing: RateLimitRecord | undefined = await kv.get(key);
  const now = Date.now();

  if (existing && now < existing.resetAt) {
    return existing;
  }

  // Window expired — delete the stale entry so it doesn't accumulate in the KV store
  if (existing) {
    kv.del(key).catch((err) =>
      console.error('Rate limiter: failed to delete expired record', key, err)
    );
  }

  return {
    count: 0,
    resetAt: now + config.windowMs,
    // Start a fresh violation count for the new window
    violations: 0,
    version: 0,
  };
}

/**
 * Increments the request count for a key using optimistic concurrency control.
 * Retries up to MAX_RETRIES times on version conflicts before falling back to
 * an unconditional write so the caller is never blocked by a locking failure.
 */
async function incrementCount(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitRecord> {
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const existing: RateLimitRecord | undefined = await kv.get(key);
    const now = Date.now();

    // Start a new window when the record is absent or expired
    if (!existing || now >= existing.resetAt) {
      if (existing) {
        kv.del(key).catch((err) =>
          console.error('Rate limiter: failed to delete expired record', key, err)
        );
      }
      const newRecord: RateLimitRecord = {
        count: 1,
        resetAt: now + config.windowMs,
        violations: 0,
        version: 1,
      };
      await kv.set(key, newRecord);
      return newRecord;
    }

    const currentVersion = existing.version ?? 0;
    const updatedRecord: RateLimitRecord = {
      ...existing,
      count: existing.count + 1,
      version: currentVersion + 1,
    };

    if (existing.version === undefined) {
      // Legacy record without version field — unconditional update
      await kv.set(key, updatedRecord);
      return updatedRecord;
    }

    // Conditional update: only write if version hasn't changed since we read it
    const { data, error } = await supabaseClient()
      .from(KV_TABLE)
      .update({ value: updatedRecord })
      .eq('key', key)
      .filter('value->>version', 'eq', currentVersion.toString())
      .select('key');

    if (error) throw error;

    if (data && data.length > 0) {
      return updatedRecord;
    }

    // Version conflict: another concurrent request updated the record — retry
    console.warn(
      `Rate limiter: concurrent update conflict for ${key}, retrying (attempt ${attempt + 1}/${MAX_RETRIES})`
    );
  }

  // All retries exhausted: fall back to unconditional update so the request is not blocked
  const fallback: RateLimitRecord | undefined = await kv.get(key);
  const now = Date.now();
  const fallbackRecord: RateLimitRecord = (fallback && now < fallback.resetAt)
    ? { ...fallback, count: fallback.count + 1, version: (fallback.version ?? 0) + 1 }
    : { count: 1, resetAt: now + config.windowMs, violations: 0, version: 1 };
  await kv.set(key, fallbackRecord);
  return fallbackRecord;
}

async function recordViolation(
  key: string,
  config: RateLimitConfig,
  identifier: string
): Promise<RateLimitRecord> {
  let record: RateLimitRecord;
  try {
    record = await getOrCreateRecord(key, config);
    record.violations = (record.violations || 0) + 1;
    record.lastViolation = Date.now();
    await kv.set(key, record);
  } catch (error) {
    console.error('Rate limiter: failed to persist violation record', error);
    // Return a minimal record so the caller can still produce a correct 429 response
    record = {
      count: config.maxRequests + 1,
      resetAt: Date.now() + config.windowMs,
      violations: 1,
      lastViolation: Date.now(),
    };
  }

  console.warn('🚨 Rate limit violation', {
    identifier,
    key,
    count: record.count,
    maxRequests: config.maxRequests,
    violations: record.violations,
    timestamp: new Date().toISOString(),
  });

  return record;
}

/**
 * Extracts the client IP from standard proxy headers.
 *
 * NOTE: This implementation assumes the function is deployed behind a trusted
 * reverse proxy (e.g. Supabase Edge, Cloudflare, or Vercel) that strips any
 * client-provided x-forwarded-for header and appends the real connecting IP.
 * Without such a proxy, malicious clients could spoof these headers and bypass
 * rate limiting.
 */
function getIdentifier(c: Context): string {
  const ip =
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    c.req.header('x-real-ip') ||
    c.req.header('cf-connecting-ip') ||
    'unknown';

  return `ip:${ip}`;
}

function isTrustedSource(identifier: string, whitelist?: string[]): boolean {
  const ip = identifier.replace('ip:', '');
  if (TRUSTED_IPS.includes(ip)) {
    return true;
  }
  if (whitelist && whitelist.includes(ip)) {
    return true;
  }
  return false;
}

function getRetryAfter(record: RateLimitRecord): number {
  const resetIn = Math.max(1, Math.ceil((record.resetAt - Date.now()) / 1000));
  // Exponential backoff capped at 5 doublings (×32)
  const backoffMultiplier = Math.pow(2, Math.min(record.violations, 5));
  return resetIn * backoffMultiplier;
}

export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };

  return async (c: Context, next: () => Promise<void>) => {
    const identifier = getIdentifier(c);

    if (isTrustedSource(identifier, finalConfig.whitelist)) {
      return next();
    }

    const method = c.req.method;
    const path = new URL(c.req.url).pathname;
    const key = `rate-limit:${method}:${path}:${identifier}`;

    try {
      const record = await incrementCount(key, finalConfig);
      const remaining = Math.max(0, finalConfig.maxRequests - record.count);
      const percentUsed = (record.count / finalConfig.maxRequests) * 100;

      c.header('X-RateLimit-Limit', finalConfig.maxRequests.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', Math.floor(record.resetAt / 1000).toString());

      // Soft limit warning
      const softPercent = finalConfig.softLimitPercent ?? 80;
      if (percentUsed >= softPercent && percentUsed < 100) {
        c.header('X-RateLimit-Warning', 'true');
        console.warn(`⚠️ Rate limit approaching for ${identifier} on ${method} ${path}`);
      }

      // Hard limit exceeded
      if (record.count >= finalConfig.maxRequests) {
        const violated = await recordViolation(key, finalConfig, identifier);
        const retryAfter = getRetryAfter(violated);

        return c.json(
          {
            success: false,
            error: 'Demasiadas solicitudes. Por favor, intenta más tarde.',
            retryAfter,
            violations: violated.violations,
          },
          429,
          {
            'Retry-After': retryAfter.toString(),
          }
        );
      }

      return next();
    } catch (error) {
      // On KV error, log and allow the request to pass through
      console.error('Rate limiter error:', error);
      return next();
    }
  };
}

/**
 * Deletes all rate-limit records whose window has already expired.
 * Should be called periodically (e.g. every 5 minutes) to prevent the KV
 * store from accumulating stale entries for IPs that never revisit.
 */
export async function cleanupExpiredRateLimitRecords(): Promise<void> {
  try {
    const supabase = supabaseClient();
    const now = Date.now();
    const { data, error } = await supabase
      .from(KV_TABLE)
      .select('key, value')
      .like('key', 'rate-limit:%');

    if (error) {
      console.error('Rate limiter cleanup: failed to fetch records', error);
      return;
    }

    const expiredKeys = (data ?? [])
      .filter((row) => row.value?.resetAt !== undefined && row.value.resetAt < now)
      .map((row) => row.key);

    if (expiredKeys.length === 0) {
      return;
    }

    const { error: delError } = await supabase
      .from(KV_TABLE)
      .delete()
      .in('key', expiredKeys);

    if (delError) {
      console.error('Rate limiter cleanup: failed to delete expired records', delError);
    } else {
      console.log(`🧹 Rate limiter cleanup: removed ${expiredKeys.length} expired record(s)`);
    }
  } catch (error) {
    console.error('Rate limiter cleanup error:', error);
  }
}

// Run cleanup every 5 minutes
if (typeof Deno !== 'undefined') {
  setInterval(cleanupExpiredRateLimitRecords, 5 * 60 * 1000);
}

