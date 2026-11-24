import { lt, sql } from "@twt/database"
import { rateLimitBuckets } from "@twt/database/schema"
import { Context, DateTime, Duration, Effect, Layer, Random } from "effect"
import { createHash } from "node:crypto"
import { isIP } from "node:net"
import { trustProxyHeaders } from "../config"
import { DatabaseError, RateLimited } from "../domain/errors"
import { Database } from "./Database"

/**
 * Derives the opaque bucket key for a caller. Only the proxy-reported address
 * is used: anything else the client sends (User-Agent included) is
 * attacker-controlled and would let a caller mint a fresh bucket per request.
 */
export function clientRateLimitKey(
  headers: Headers,
  action: string,
  options: { readonly trustProxyHeaders: boolean },
): string {
  const forwardedChain = options.trustProxyHeaders
    ? headers
        .get("x-forwarded-for")
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined
  const candidate =
    (options.trustProxyHeaders ? headers.get("x-real-ip")?.trim() : undefined) ??
    forwardedChain?.at(-1) ??
    "unknown"
  const ip = isIP(candidate) ? candidate : "unknown"

  return createHash("sha256").update(`${action}:${ip}`).digest("hex")
}

export class RateLimiter extends Context.Service<
  RateLimiter,
  {
    /** Counts one request against the caller's bucket and fails once `limit` is exceeded. */
    enforce(options: {
      readonly headers: Headers
      readonly action: string
      readonly limit: number
      readonly window: Duration.Input
    }): Effect.Effect<void, RateLimited | DatabaseError>
  }
>()("@twt/core/services/RateLimiter") {
  static readonly layerNoDeps = Layer.effect(
    RateLimiter,
    Effect.gen(function* () {
      const database = yield* Database
      const trustProxy = yield* trustProxyHeaders

      const enforce = Effect.fn("RateLimiter.enforce")(function* (options: {
        readonly headers: Headers
        readonly action: string
        readonly limit: number
        readonly window: Duration.Input
      }) {
        const key = clientRateLimitKey(options.headers, options.action, {
          trustProxyHeaders: trustProxy,
        })
        const now = DateTime.toDateUtc(yield* DateTime.now)
        const resetAt = new Date(now.getTime() + Duration.toMillis(options.window))

        const [bucket] = yield* database.query("rateLimit.upsert", (db) =>
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

        if (!bucket || bucket.count > options.limit) {
          return yield* new RateLimited({
            message: "Slow down and try again in a bit.",
            retryAfterMs: bucket ? Math.max(0, bucket.resetAt.getTime() - now.getTime()) : 0,
          })
        }

        // Amortized cleanup keeps the table bounded without a hot-path query every time.
        if ((yield* Random.next) < 0.01) {
          yield* database
            .query("rateLimit.cleanup", (db) =>
              db.delete(rateLimitBuckets).where(lt(rateLimitBuckets.resetAt, now)),
            )
            .pipe(
              Effect.catch((error) =>
                Effect.logWarning("Expired rate-limit bucket cleanup failed", error),
              ),
              Effect.forkDetach,
            )
        }
      })

      return RateLimiter.of({ enforce })
    }),
  )

  static readonly layer = this.layerNoDeps.pipe(Layer.provide(Database.layer))
}
