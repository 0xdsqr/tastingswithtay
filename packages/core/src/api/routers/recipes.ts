import type { TRPCRouterRecord } from "@trpc/server"
import {
  createRecipeSchema,
  recipes,
  recipeTags,
  tags,
  updateRecipeSchema,
} from "@twt/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, publicProcedure } from "../trpc"

export const recipesRouter = {
  // Public: Get all published recipes
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

      const result = await ctx.db
        .select()
        .from(recipes)
        .where(and(...conditions))
        .orderBy(desc(recipes.createdAt))
        .limit(limit)
        .offset(offset)

      return result
    }),

  // Public: Get recipe by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [recipe] = await ctx.db
        .select()
        .from(recipes)
        .where(and(eq(recipes.slug, input.slug), eq(recipes.published, true)))
        .limit(1)

      return recipe ?? null
    }),

  // Public: Get all categories
  categories: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ category: recipes.category })
      .from(recipes)
      .where(eq(recipes.published, true))
      .orderBy(recipes.category)

    return result.map((r) => r.category)
  }),

  // Public: Get recipe tags
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

  // Public: Get featured recipes
  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(recipes)
      .where(and(eq(recipes.published, true), eq(recipes.featured, true)))
      .orderBy(desc(recipes.createdAt))
      .limit(6)
  }),

  // Admin: Get all recipes including drafts
  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(recipes).orderBy(desc(recipes.updatedAt))
  }),

  // Admin: Create recipe
  create: adminProcedure
    .input(createRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      const [recipe] = await ctx.db.insert(recipes).values(input).returning()
      return recipe
    }),

  // Admin: Update recipe
  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), data: updateRecipeSchema }))
    .mutation(async ({ ctx, input }) => {
      const cleanData = Object.fromEntries(
        Object.entries(input.data).filter(([_, v]) => v !== undefined),
      )

      const [recipe] = await ctx.db
        .update(recipes)
        .set(cleanData)
        .where(eq(recipes.id, input.id))
        .returning()

      return recipe
    }),

  // Admin: Delete recipe
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(recipes).where(eq(recipes.id, input.id))
      return { success: true }
    }),

  // Public: Increment view count
  incrementView: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recipes)
        .set({ viewCount: sql`${recipes.viewCount} + 1` })
        .where(eq(recipes.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
