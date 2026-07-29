import { TRPCError } from "@trpc/server"
import { rateLimitBuckets } from "@twt/database/schema"
import { createHash } from "node:crypto"
import { isIP } from "node:net"
import { lt, sql } from "@twt/database"
import type { db as database } from "@twt/database/client"
import { runPersistence } from "../effect/persistence"

export function clientRateLimitKey(headers: Headers, action: string, scope?: string): string {
  const trustProxyHeaders = process.env.TRUST_PROXY_HEADERS === "true"
  const forwardedChain = trustProxyHeaders
    ? headers
        .get("x-forwarded-for")
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined
  const candidate =
    (trustProxyHeaders ? headers.get("x-real-ip")?.trim() : undefined) ??
    forwardedChain?.at(-1) ??
    "unknown"
  const ip = isIP(candidate) ? candidate : "unknown"
  const client = scope ?? `${ip}:${headers.get("user-agent")?.slice(0, 160) ?? "unknown"}`

  return createHash("sha256").update(`${action}:${client}`).digest("hex")
}

export async function enforceRateLimit({
  db,
  key,
  limit,
  windowMs,
}: {
  db: typeof database
  key: string
  limit: number
  windowMs: number
}): Promise<void> {
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)
  const [bucket] = await runPersistence("rate-limit.upsert", () =>
    db
      .insert(rateLimitBuckets)
      .values({ key, count: 1, resetAt })
      .onConflictDoUpdate({
        target: rateLimitBuckets.key,
        set: {
          count: sql<number>`CASE WHEN ${rateLimitBuckets.resetAt} <= ${now} THEN 1 ELSE ${rateLimitBuckets.count} + 1 END`,
          resetAt: sql<Date>`CASE WHEN ${rateLimitBuckets.resetAt} <= ${now} THEN ${resetAt} ELSE ${rateLimitBuckets.resetAt} END`,
        },
      })
      .returning({ count: rateLimitBuckets.count, resetAt: rateLimitBuckets.resetAt }),
  )

  if (!bucket || bucket.count > limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Slow down and try again in a bit.",
      cause: bucket
        ? { retryAfterMs: Math.max(0, bucket.resetAt.getTime() - now.getTime()) }
        : undefined,
    })
  }

  // Amortized cleanup keeps the table bounded without adding a hot-path query every time.
  if (Math.random() < 0.01) {
    void db
      .delete(rateLimitBuckets)
      .where(lt(rateLimitBuckets.resetAt, now))
      .catch((error) => {
        console.error("[rate-limit] Expired bucket cleanup failed", {
          message: error instanceof Error ? error.message : "Unknown error",
        })
      })
  }
}
