interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Limitador simples em memória.
 *
 * Atenção: o estado vive no processo. Em ambiente serverless com várias
 * instâncias, cada uma tem seu próprio contador — serve para frear tentativa de
 * força bruta casual, não como defesa distribuída. Se isso virar requisito,
 * troque por Redis/Upstash mantendo esta mesma assinatura.
 */
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  options: { limit: number; windowSeconds: number },
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfterSeconds: 0,
    };
  }

  existing.count += 1;
  const allowed = existing.count <= options.limit;

  return {
    allowed,
    remaining: Math.max(0, options.limit - existing.count),
    retryAfterSeconds: allowed
      ? 0
      : Math.ceil((existing.resetAt - now) / 1000),
  };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

/** Evita vazamento de memória em processos de vida longa (dev server). */
export function pruneRateLimitBuckets(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
