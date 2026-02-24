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
  };
}

async function incrementCount(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitRecord> {
  const record = await getOrCreateRecord(key, config);
  record.count++;
  await kv.set(key, record);
  return record;
}

async function recordViolation(
  key: string,
  config: RateLimitConfig,
  identifier: string
): Promise<RateLimitRecord> {
  const record = await getOrCreateRecord(key, config);
  record.violations = (record.violations || 0) + 1;
  record.lastViolation = Date.now();
  await kv.set(key, record);

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

function getIdentifier(c: Context): string {
  // Prefer the first IP from x-forwarded-for (most proxies prepend the real IP),
  // then fall back to other common headers.
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
