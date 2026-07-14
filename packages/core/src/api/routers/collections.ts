import type { TRPCRouterRecord } from "@trpc/server"
import { collectionRecipes, collections, collectionWines, recipes, wines } from "@twt/db/schema"
import { and, asc, desc, eq } from "@twt/db"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const collectionsRouter = {
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(collections)
      .where(eq(collections.published, true))
      .orderBy(desc(collections.createdAt))
  }),

  bySlug: publicProcedure
    .input(
      z.object({
        slug: z
          .string()
          .min(1)
          .max(256)
          .regex(/^[a-z0-9-]+$/),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [collection] = await ctx.db
        .select()
        .from(collections)
        .where(and(eq(collections.slug, input.slug), eq(collections.published, true)))
        .limit(1)

      if (!collection) return null

      const collectionRecipesList = await ctx.db
        .select({ recipe: recipes, sortOrder: collectionRecipes.sortOrder })
        .from(collectionRecipes)
        .innerJoin(recipes, eq(collectionRecipes.recipeId, recipes.id))
        .where(and(eq(collectionRecipes.collectionId, collection.id), eq(recipes.published, true)))
        .orderBy(asc(collectionRecipes.sortOrder))

      const collectionWinesList = await ctx.db
        .select({ wine: wines, sortOrder: collectionWines.sortOrder })
        .from(collectionWines)
        .innerJoin(wines, eq(collectionWines.wineId, wines.id))
        .where(and(eq(collectionWines.collectionId, collection.id), eq(wines.published, true)))
        .orderBy(asc(collectionWines.sortOrder))

      return {
        ...collection,
        recipes: collectionRecipesList.map((r) => r.recipe),
        wines: collectionWinesList.map((w) => w.wine),
      }
    }),

  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(collections)
      .where(and(eq(collections.published, true), eq(collections.featured, true)))
      .orderBy(desc(collections.createdAt))
      .limit(4)
  }),
} satisfies TRPCRouterRecord
