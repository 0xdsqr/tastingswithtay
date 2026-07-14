import type { TRPCRouterRecord } from "@trpc/server"
import { recipeFavorites, recipes, wineFavorites, wines } from "@twt/db/schema"
import { and, desc, eq } from "@twt/db"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { protectedProcedure } from "../trpc"

export const favoritesRouter = {
  // Protected: Get user's favorite recipes
  recipes: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({ recipe: recipes, favoritedAt: recipeFavorites.createdAt })
      .from(recipeFavorites)
      .innerJoin(recipes, eq(recipeFavorites.recipeId, recipes.id))
      .where(and(eq(recipeFavorites.userId, ctx.session.user.id), eq(recipes.published, true)))
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

      const [recipe] = await ctx.db
        .select({ id: recipes.id })
        .from(recipes)
        .where(and(eq(recipes.id, input.recipeId), eq(recipes.published, true)))
        .limit(1)

      if (!recipe) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found." })
      }

      await ctx.db
        .insert(recipeFavorites)
        .values({
          userId: ctx.session.user.id,
          recipeId: input.recipeId,
        })
        .onConflictDoNothing()
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
      .where(and(eq(wineFavorites.userId, ctx.session.user.id), eq(wines.published, true)))
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

      const [wine] = await ctx.db
        .select({ id: wines.id })
        .from(wines)
        .where(and(eq(wines.id, input.wineId), eq(wines.published, true)))
        .limit(1)

      if (!wine) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Wine not found." })
      }

      await ctx.db
        .insert(wineFavorites)
        .values({
          userId: ctx.session.user.id,
          wineId: input.wineId,
        })
        .onConflictDoNothing()
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
