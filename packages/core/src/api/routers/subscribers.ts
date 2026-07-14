import type { TRPCRouterRecord } from "@trpc/server"
import { createSubscriberSchema, subscribers } from "@twt/db/schema"
import { eq } from "@twt/db"
import { z } from "zod"
import { clientRateLimitKey, enforceRateLimit } from "../rate-limit"
import { publicProcedure } from "../trpc"

export const subscribersRouter = {
  subscribe: publicProcedure.input(createSubscriberSchema).mutation(async ({ ctx, input }) => {
    await enforceRateLimit({
      db: ctx.db,
      key: clientRateLimitKey(ctx.headers, "subscribers.subscribe"),
      limit: 5,
      windowMs: 60 * 60_000,
    })

    const email = input.email.trim().toLowerCase()
    await ctx.db
      .insert(subscribers)
      .values({ email })
      .onConflictDoUpdate({
        target: subscribers.email,
        set: { active: true, unsubscribedAt: null, subscribedAt: new Date() },
      })

    return { success: true, message: "If eligible, this address is now subscribed." }
  }),

  unsubscribe: publicProcedure
    .input(z.object({ token: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit({
        db: ctx.db,
        key: clientRateLimitKey(ctx.headers, "subscribers.unsubscribe"),
        limit: 20,
        windowMs: 60 * 60_000,
      })

      const [subscriber] = await ctx.db
        .select()
        .from(subscribers)
        .where(eq(subscribers.unsubscribeToken, input.token))
        .limit(1)

      if (!subscriber) return { success: true, message: "Subscription preference updated." }

      await ctx.db
        .update(subscribers)
        .set({ active: false, unsubscribedAt: new Date() })
        .where(eq(subscribers.id, subscriber.id))

      return { success: true, message: "Subscription preference updated." }
    }),
} satisfies TRPCRouterRecord
