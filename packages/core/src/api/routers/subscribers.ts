import type { TRPCRouterRecord } from "@trpc/server"
import { createSubscriberSchema, subscribers } from "@twt/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, publicProcedure } from "../trpc"

export const subscribersRouter = {
  // Public: Subscribe to newsletter
  subscribe: publicProcedure
    .input(createSubscriberSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if already subscribed
      const [existing] = await ctx.db
        .select()
        .from(subscribers)
        .where(eq(subscribers.email, input.email))
        .limit(1)

      if (existing) {
        // If inactive, reactivate
        if (!existing.active) {
          await ctx.db
            .update(subscribers)
            .set({ active: true, unsubscribedAt: null })
            .where(eq(subscribers.id, existing.id))
          return { success: true, message: "Welcome back!" }
        }
        return { success: true, message: "You're already subscribed!" }
      }

      // Create new subscriber
      await ctx.db.insert(subscribers).values(input)
      return { success: true, message: "Thanks for subscribing!" }
    }),

  // Public: Unsubscribe from newsletter
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

  // Admin: Get all subscribers
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(subscribers).orderBy(subscribers.subscribedAt)
  }),

  // Admin: Get active subscribers count
  count: adminProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(subscribers)
      .where(eq(subscribers.active, true))

    return result.length
  }),
} satisfies TRPCRouterRecord
