import type { TRPCRouterRecord } from "@trpc/server"
import {
  createRecipeRatingSchema,
  recipeRatings,
  recipes,
  user,
} from "@twt/db/schema"
import { and, avg, count, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, protectedProcedure, publicProcedure } from "../trpc"

export const ratingsRouter = {
  // Public: Get average rating for a recipe
  recipeAverage: publicProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({
          average: avg(recipeRatings.rating),
          count: count(),
        })
        .from(recipeRatings)
        .where(eq(recipeRatings.recipeId, input.recipeId))

      return {
        average: result?.average ? Number(result.average) : null,
        count: result?.count ?? 0,
      }
    }),

  // Public: Get rating distribution for a recipe
  recipeDistribution: publicProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          rating: recipeRatings.rating,
          count: count(),
        })
        .from(recipeRatings)
        .where(eq(recipeRatings.recipeId, input.recipeId))
        .groupBy(recipeRatings.rating)

      // Build distribution object (1-5)
      const distribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      }
      for (const row of result) {
        distribution[row.rating] = row.count
      }

      return distribution
    }),

  // Public: Get reviews with ratings for a recipe
  recipeReviews: publicProcedure
    .input(
      z.object({
        recipeId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          rating: recipeRatings,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(recipeRatings)
        .innerJoin(user, eq(recipeRatings.userId, user.id))
        .where(eq(recipeRatings.recipeId, input.recipeId))
        .orderBy(sql`${recipeRatings.createdAt} DESC`)
        .limit(input.limit)
        .offset(input.offset)

      return result
    }),

  // Protected: Get current user's rating for a recipe
  myRecipeRating: protectedProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [rating] = await ctx.db
        .select()
        .from(recipeRatings)
        .where(
          and(
            eq(recipeRatings.recipeId, input.recipeId),
            eq(recipeRatings.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      return rating ?? null
    }),

  // Protected: Create or update rating
  rateRecipe: protectedProcedure
    .input(createRecipeRatingSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user already rated this recipe
      const [existing] = await ctx.db
        .select()
        .from(recipeRatings)
        .where(
          and(
            eq(recipeRatings.recipeId, input.recipeId),
            eq(recipeRatings.userId, ctx.session.user.id),
          ),
        )
        .limit(1)

      if (existing) {
        // Update existing rating
        const [rating] = await ctx.db
          .update(recipeRatings)
          .set({
            rating: input.rating,
            review: input.review,
          })
          .where(eq(recipeRatings.id, existing.id))
          .returning()

        return rating
      }

      // Create new rating
      const [rating] = await ctx.db
        .insert(recipeRatings)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning()

      return rating
    }),

  // Protected: Delete own rating
  deleteMyRating: protectedProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(recipeRatings)
        .where(
          and(
            eq(recipeRatings.recipeId, input.recipeId),
            eq(recipeRatings.userId, ctx.session.user.id),
          ),
        )

      return { success: true }
    }),

  // Admin: Delete any rating
  adminDeleteRating: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(recipeRatings).where(eq(recipeRatings.id, input.id))
      return { success: true }
    }),

  // Public: Get top rated recipes
  topRated: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(20).default(10),
          minRatings: z.number().min(1).default(3),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { limit = 10, minRatings = 3 } = input ?? {}

      const result = await ctx.db
        .select({
          recipe: recipes,
          averageRating: avg(recipeRatings.rating),
          ratingCount: count(recipeRatings.id),
        })
        .from(recipes)
        .innerJoin(recipeRatings, eq(recipes.id, recipeRatings.recipeId))
        .where(eq(recipes.published, true))
        .groupBy(recipes.id)
        .having(sql`count(${recipeRatings.id}) >= ${minRatings}`)
        .orderBy(sql`avg(${recipeRatings.rating}) DESC`)
        .limit(limit)

      return result.map((row) => ({
        ...row.recipe,
        averageRating: Number(row.averageRating),
        ratingCount: row.ratingCount,
      }))
    }),
} satisfies TRPCRouterRecord
