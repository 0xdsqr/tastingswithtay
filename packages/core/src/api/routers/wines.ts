import type { TRPCRouterRecord } from "@trpc/server"
import { tags, wines, wineTags } from "@twt/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const winesRouter = {
  list: publicProcedure
    .input(
      z
        .object({
          type: z.string().optional(),
          country: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { type, country, limit = 20, offset = 0 } = input ?? {}

      const conditions = [eq(wines.published, true)]
      if (type) {
        conditions.push(eq(wines.type, type))
      }
      if (country) {
        conditions.push(eq(wines.country, country))
      }

      return ctx.db
        .select()
        .from(wines)
        .where(and(...conditions))
        .orderBy(desc(wines.createdAt))
        .limit(limit)
        .offset(offset)
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [wine] = await ctx.db
        .select()
        .from(wines)
        .where(and(eq(wines.slug, input.slug), eq(wines.published, true)))
        .limit(1)

      return wine ?? null
    }),

  types: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ type: wines.type })
      .from(wines)
      .where(eq(wines.published, true))
      .orderBy(wines.type)

    return result.map((r) => r.type)
  }),

  tags: publicProcedure
    .input(z.object({ wineId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ tag: tags })
        .from(wineTags)
        .innerJoin(tags, eq(wineTags.tagId, tags.id))
        .where(eq(wineTags.wineId, input.wineId))

      return result.map((r) => r.tag)
    }),

  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(wines)
      .where(and(eq(wines.published, true), eq(wines.featured, true)))
      .orderBy(desc(wines.rating))
      .limit(6)
  }),
} satisfies TRPCRouterRecord
