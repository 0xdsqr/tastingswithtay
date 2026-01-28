import type { TRPCRouterRecord } from "@trpc/server"
import { recipeFavorites, recipes, wineFavorites, wines } from "@twt/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"
import { protectedProcedure } from "../trpc"

export const favoritesRouter = {
  // Protected: Get user's favorite recipes
  recipes: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ recipe: recipes, favoritedAt: recipeFavorites.createdAt })
      .from(recipeFavorites)
      .innerJoin(recipes, eq(recipeFavorites.recipeId, recipes.id))
      .where(eq(recipeFavorites.userId, ctx.session.user.id))
      .orderBy(desc(recipeFavorites.createdAt))

    return result.map((r) => ({ ...r.recipe, favoritedAt: r.favoritedAt }))
  }),

  // Protected: Toggle recipe favorite
  toggleRecipe: protectedProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(recipeFavorites)
        .where(
          and(
            eq(recipeFavorites.userId, ctx.session.user.id),
            eq(recipeFavorites.recipeId, input.recipeId),
          ),
        )
        .limit(1)

      if (existing) {
        await ctx.db
          .delete(recipeFavorites)
          .where(
            and(
              eq(recipeFavorites.userId, ctx.session.user.id),
              eq(recipeFavorites.recipeId, input.recipeId),
            ),
          )
        return { favorited: false }
      }

      await ctx.db.insert(recipeFavorites).values({
        userId: ctx.session.user.id,
        recipeId: input.recipeId,
      })
      return { favorited: true }
    }),

  // Protected: Check if recipe is favorited
  isRecipeFavorited: protectedProcedure
    .input(z.object({ recipeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(recipeFavorites)
        .where(
          and(
            eq(recipeFavorites.userId, ctx.session.user.id),
            eq(recipeFavorites.recipeId, input.recipeId),
          ),
        )
        .limit(1)

      return !!existing
    }),

  // Protected: Get user's favorite wines
  wines: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ wine: wines, favoritedAt: wineFavorites.createdAt })
      .from(wineFavorites)
      .innerJoin(wines, eq(wineFavorites.wineId, wines.id))
      .where(eq(wineFavorites.userId, ctx.session.user.id))
      .orderBy(desc(wineFavorites.createdAt))

    return result.map((r) => ({ ...r.wine, favoritedAt: r.favoritedAt }))
  }),

  // Protected: Toggle wine favorite
  toggleWine: protectedProcedure
    .input(z.object({ wineId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(wineFavorites)
        .where(
          and(
            eq(wineFavorites.userId, ctx.session.user.id),
            eq(wineFavorites.wineId, input.wineId),
          ),
        )
        .limit(1)

      if (existing) {
        await ctx.db
          .delete(wineFavorites)
          .where(
            and(
              eq(wineFavorites.userId, ctx.session.user.id),
              eq(wineFavorites.wineId, input.wineId),
            ),
          )
        return { favorited: false }
      }

      await ctx.db.insert(wineFavorites).values({
        userId: ctx.session.user.id,
        wineId: input.wineId,
      })
      return { favorited: true }
    }),

  // Protected: Check if wine is favorited
  isWineFavorited: protectedProcedure
    .input(z.object({ wineId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(wineFavorites)
        .where(
          and(
            eq(wineFavorites.userId, ctx.session.user.id),
            eq(wineFavorites.wineId, input.wineId),
          ),
        )
        .limit(1)

      return !!existing
    }),
} satisfies TRPCRouterRecord
