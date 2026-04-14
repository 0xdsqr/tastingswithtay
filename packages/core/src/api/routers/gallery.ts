import type { TRPCRouterRecord } from "@trpc/server"
import { galleryImages } from "@twt/db/schema"
import { and, asc, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const galleryRouter = {
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { category, limit = 50, offset = 0 } = input ?? {}

      const conditions = [eq(galleryImages.published, true)]
      if (category) {
        conditions.push(eq(galleryImages.category, category))
      }

      return ctx.db
        .select()
        .from(galleryImages)
        .where(and(...conditions))
        .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt))
        .limit(limit)
        .offset(offset)
    }),

  categoryCounts: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        category: galleryImages.category,
        count: sql<number>`count(*)::int`,
      })
      .from(galleryImages)
      .where(eq(galleryImages.published, true))
      .groupBy(galleryImages.category)

    return result
  }),
} satisfies TRPCRouterRecord
