import { TRPCError } from "@trpc/server"

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function clientRateLimitKey(headers: Headers, action: string, scope?: string): string {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = headers.get("x-real-ip")?.trim()
  const ip = forwardedFor || realIp || "unknown"

  return [action, scope, ip].filter(Boolean).join(":")
}

export function assertRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): void {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (current.count >= limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Slow down and try again in a bit.",
    })
  }

  current.count += 1
}
