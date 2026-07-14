import { TRPCError, type TRPCRouterRecord } from "@trpc/server"
import { createRecipeRatingSchema, recipeRatings, recipes, user } from "@twt/db/schema"
import { and, avg, count, eq, sql } from "@twt/db"
import { z } from "zod"
import { clientRateLimitKey, enforceRateLimit } from "../rate-limit"
import { protectedProcedure, publicProcedure } from "../trpc"

export const ratingsRouter = {
  recipeAverage: publicProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({
          average: avg(recipeRatings.rating),
          count: count(),
        })
        .from(recipeRatings)
        .innerJoin(recipes, eq(recipeRatings.recipeId, recipes.id))
        .where(and(eq(recipeRatings.recipeId, input.recipeId), eq(recipes.published, true)))

      return {
        average: result?.average ? Number(result.average) : null,
        count: result?.count ?? 0,
      }
    }),

  recipeDistribution: publicProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          rating: recipeRatings.rating,
          count: count(),
        })
        .from(recipeRatings)
        .innerJoin(recipes, eq(recipeRatings.recipeId, recipes.id))
        .where(and(eq(recipeRatings.recipeId, input.recipeId), eq(recipes.published, true)))
        .groupBy(recipeRatings.rating)

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

  recipeReviews: publicProcedure
    .input(
      z.object({
        recipeId: z.string().uuid(),
        limit: z.number().int().min(1).max(50).default(10),
        offset: z.number().int().min(0).max(10_000).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
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
        .innerJoin(recipes, eq(recipeRatings.recipeId, recipes.id))
        .where(and(eq(recipeRatings.recipeId, input.recipeId), eq(recipes.published, true)))
        .orderBy(sql`${recipeRatings.createdAt} DESC`)
        .limit(input.limit)
        .offset(input.offset)
    }),

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

  rateRecipe: protectedProcedure
    .input(createRecipeRatingSchema)
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit({
        db: ctx.db,
        key: clientRateLimitKey(ctx.headers, "ratings.rateRecipe", ctx.session.user.id),
        limit: 20,
        windowMs: 60_000,
      })

      const [recipe] = await ctx.db
        .select({ id: recipes.id })
        .from(recipes)
        .where(and(eq(recipes.id, input.recipeId), eq(recipes.published, true)))
        .limit(1)
      if (!recipe) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found." })
      }

      const [rating] = await ctx.db
        .insert(recipeRatings)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: [recipeRatings.userId, recipeRatings.recipeId],
          set: {
            rating: input.rating,
            review: input.review,
            updatedAt: new Date(),
          },
        })
        .returning()

      return rating
    }),

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

  topRated: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).default(10),
          minRatings: z.number().int().min(1).max(10_000).default(3),
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
