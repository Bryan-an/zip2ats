/**
 * Best-effort in-memory rate limiting.
 *
 * Notes:
 * - This is designed for public endpoints where we want basic abuse protection.
 * - In-memory limits are per isolate/process and can be bypassed across isolates.
 * - For strong protection, prefer Cloudflare edge rate limiting rules.
 */

import type { NextRequest } from "next/server";

export interface RateLimitOptions {
  /**
   * Key prefix to separate buckets per endpoint/purpose.
   * Example: "upload", "ats-generate"
   */
  keyPrefix: string;
  /** Fixed window duration in milliseconds */
  windowMs: number;
  /** Max requests allowed per window */
  maxRequests: number;
}

export type RateLimitResult =
  | {
      allowed: true;
      remaining: number;
      resetAt: number;
    }
  | {
      allowed: false;
      remaining: 0;
      resetAt: number;
      retryAfterSeconds: number;
    };

type BucketState = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, BucketState>();

function getClientIp(request: Request): string {
  const headers = request.headers;

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  const xForwardedFor = headers.get("x-forwarded-for");

  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  return "unknown";
}

function getClientId(request: Request): string {
  const ip = getClientIp(request);
  if (ip !== "unknown") return ip;

  // Local dev / unknown IP fallback to avoid grouping everyone together too aggressively.
  const ua = request.headers.get("user-agent") ?? "unknown-ua";
  return `unknown:${ua.slice(0, 80)}`;
}

function makeBucketKey(request: Request, keyPrefix: string): string {
  // Include method to avoid sharing buckets across different methods.
  return `${keyPrefix}:${request.method}:${getClientId(request)}`;
}

/**
 * Fixed-window rate limiter.
 */
export function rateLimit(
  request: NextRequest | Request,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = makeBucketKey(request, options.keyPrefix);

  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + options.windowMs;
    const next: BucketState = { count: 1, resetAt };
    buckets.set(key, next);

    return {
      allowed: true,
      remaining: Math.max(0, options.maxRequests - next.count),
      resetAt,
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  if (existing.count > options.maxRequests) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    );

    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - existing.count),
    resetAt: existing.resetAt,
  };
}
