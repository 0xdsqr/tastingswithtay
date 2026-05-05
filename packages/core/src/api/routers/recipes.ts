import type { TRPCRouterRecord } from "@trpc/server"
import { recipes, recipeTags, tags } from "@twt/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { assertRateLimit, clientRateLimitKey } from "../rate-limit"
import { publicProcedure } from "../trpc"

export const recipesRouter = {
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { category, limit = 20, offset = 0 } = input ?? {}

      const conditions = [eq(recipes.published, true)]
      if (category) {
        conditions.push(eq(recipes.category, category))
      }

      return ctx.db
        .select()
        .from(recipes)
        .where(and(...conditions))
        .orderBy(desc(recipes.createdAt))
        .limit(limit)
        .offset(offset)
    }),

  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const [recipe] = await ctx.db
      .select()
      .from(recipes)
      .where(and(eq(recipes.slug, input.slug), eq(recipes.published, true)))
      .limit(1)

    return recipe ?? null
  }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ category: recipes.category })
      .from(recipes)
      .where(eq(recipes.published, true))
      .orderBy(recipes.category)

    return result.map((r) => r.category)
  }),

  tags: publicProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ tag: tags })
        .from(recipeTags)
        .innerJoin(tags, eq(recipeTags.tagId, tags.id))
        .where(eq(recipeTags.recipeId, input.recipeId))

      return result.map((r) => r.tag)
    }),

  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(recipes)
      .where(and(eq(recipes.published, true), eq(recipes.featured, true)))
      .orderBy(desc(recipes.createdAt))
      .limit(6)
  }),

  incrementView: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      assertRateLimit({
        key: clientRateLimitKey(ctx.headers, "recipes.incrementView", input.id),
        limit: 1,
        windowMs: 10 * 60_000,
      })

      await ctx.db
        .update(recipes)
        .set({ viewCount: sql`${recipes.viewCount} + 1` })
        .where(eq(recipes.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
