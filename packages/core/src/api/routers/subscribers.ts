import type { TRPCRouterRecord } from "@trpc/server"
import { createSubscriberSchema, subscribers } from "@twt/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { assertRateLimit, clientRateLimitKey } from "../rate-limit"
import { publicProcedure } from "../trpc"

export const subscribersRouter = {
  subscribe: publicProcedure.input(createSubscriberSchema).mutation(async ({ ctx, input }) => {
    assertRateLimit({
      key: clientRateLimitKey(ctx.headers, "subscribers.subscribe"),
      limit: 5,
      windowMs: 60 * 60_000,
    })

    const email = input.email.trim().toLowerCase()
    const [existing] = await ctx.db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email))
      .limit(1)

    if (existing) {
      if (!existing.active) {
        await ctx.db
          .update(subscribers)
          .set({ active: true, unsubscribedAt: null })
          .where(eq(subscribers.id, existing.id))
        return { success: true, message: "Welcome back!" }
      }

      return { success: true, message: "You're already subscribed!" }
    }

    await ctx.db.insert(subscribers).values({ ...input, email })
    return { success: true, message: "Thanks for subscribing!" }
  }),

  unsubscribe: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [subscriber] = await ctx.db
        .select()
        .from(subscribers)
        .where(eq(subscribers.unsubscribeToken, input.token))
        .limit(1)

      if (!subscriber) {
        return { success: false, message: "Invalid unsubscribe link" }
      }

      await ctx.db
        .update(subscribers)
        .set({ active: false, unsubscribedAt: new Date() })
        .where(eq(subscribers.id, subscriber.id))

      return { success: true, message: "You've been unsubscribed" }
    }),
} satisfies TRPCRouterRecord
