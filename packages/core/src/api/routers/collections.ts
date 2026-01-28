import type { TRPCRouterRecord } from "@trpc/server"
import {
  collectionRecipes,
  collections,
  collectionWines,
  createCollectionSchema,
  recipes,
  updateCollectionSchema,
  wines,
} from "@twt/db/schema"
import { and, asc, desc, eq } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, publicProcedure } from "../trpc"

export const collectionsRouter = {
  // Public: Get all published collections
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(collections)
      .where(eq(collections.published, true))
      .orderBy(desc(collections.createdAt))
  }),

  // Public: Get collection by slug with its items
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [collection] = await ctx.db
        .select()
        .from(collections)
        .where(
          and(
            eq(collections.slug, input.slug),
            eq(collections.published, true),
          ),
        )
        .limit(1)

      if (!collection) return null

      // Get recipes in this collection
      const collectionRecipesList = await ctx.db
        .select({ recipe: recipes, sortOrder: collectionRecipes.sortOrder })
        .from(collectionRecipes)
        .innerJoin(recipes, eq(collectionRecipes.recipeId, recipes.id))
        .where(eq(collectionRecipes.collectionId, collection.id))
        .orderBy(asc(collectionRecipes.sortOrder))

      // Get wines in this collection
      const collectionWinesList = await ctx.db
        .select({ wine: wines, sortOrder: collectionWines.sortOrder })
        .from(collectionWines)
        .innerJoin(wines, eq(collectionWines.wineId, wines.id))
        .where(eq(collectionWines.collectionId, collection.id))
        .orderBy(asc(collectionWines.sortOrder))

      return {
        ...collection,
        recipes: collectionRecipesList.map((r) => r.recipe),
        wines: collectionWinesList.map((w) => w.wine),
      }
    }),

  // Public: Get featured collections
  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(collections)
      .where(
        and(eq(collections.published, true), eq(collections.featured, true)),
      )
      .orderBy(desc(collections.createdAt))
      .limit(4)
  }),

  // Admin: Get all collections
  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(collections)
      .orderBy(desc(collections.updatedAt))
  }),

  // Admin: Create collection
  create: adminProcedure
    .input(createCollectionSchema)
    .mutation(async ({ ctx, input }) => {
      const [collection] = await ctx.db
        .insert(collections)
        .values(input)
        .returning()
      return collection
    }),

  // Admin: Update collection
  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), data: updateCollectionSchema }))
    .mutation(async ({ ctx, input }) => {
      const cleanData = Object.fromEntries(
        Object.entries(input.data).filter(([_, v]) => v !== undefined),
      )

      const [collection] = await ctx.db
        .update(collections)
        .set(cleanData)
        .where(eq(collections.id, input.id))
        .returning()

      return collection
    }),

  // Admin: Delete collection
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(collections).where(eq(collections.id, input.id))
      return { success: true }
    }),

  // Admin: Add recipe to collection
  addRecipe: adminProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        recipeId: z.string().uuid(),
        sortOrder: z.number().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(collectionRecipes).values(input)
      return { success: true }
    }),

  // Admin: Remove recipe from collection
  removeRecipe: adminProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        recipeId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(collectionRecipes)
        .where(
          and(
            eq(collectionRecipes.collectionId, input.collectionId),
            eq(collectionRecipes.recipeId, input.recipeId),
          ),
        )
      return { success: true }
    }),

  // Admin: Add wine to collection
  addWine: adminProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        wineId: z.string().uuid(),
        sortOrder: z.number().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(collectionWines).values(input)
      return { success: true }
    }),

  // Admin: Remove wine from collection
  removeWine: adminProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        wineId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(collectionWines)
        .where(
          and(
            eq(collectionWines.collectionId, input.collectionId),
            eq(collectionWines.wineId, input.wineId),
          ),
        )
      return { success: true }
    }),
} satisfies TRPCRouterRecord
