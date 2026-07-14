import { TRPCError, type TRPCRouterRecord } from "@trpc/server"
import {
  createRecipeCommentSchema,
  createWineCommentSchema,
  recipeComments,
  recipes,
  user,
  wineComments,
  wines,
} from "@twt/db/schema"
import { and, desc, eq, inArray, isNull } from "@twt/db"
import { z } from "zod"
import { clientRateLimitKey, enforceRateLimit } from "../rate-limit"
import { protectedProcedure, publicProcedure } from "../trpc"

export const commentsRouter = {
  recipeComments: publicProcedure
    .input(
      z.object({
        recipeId: z.string().uuid(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).max(10_000).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [recipe] = await ctx.db
        .select({ id: recipes.id })
        .from(recipes)
        .where(and(eq(recipes.id, input.recipeId), eq(recipes.published, true)))
        .limit(1)
      if (!recipe) return []

      const topLevel = await ctx.db
        .select({
          comment: recipeComments,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(recipeComments)
        .innerJoin(user, eq(recipeComments.userId, user.id))
        .where(
          and(
            eq(recipeComments.recipeId, input.recipeId),
            eq(recipeComments.isActive, true),
            isNull(recipeComments.parentId),
          ),
        )
        .orderBy(desc(recipeComments.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const commentIds = topLevel.map((c) => c.comment.id)
      if (commentIds.length === 0) return []

      const replies = await ctx.db
        .select({
          comment: recipeComments,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(recipeComments)
        .innerJoin(user, eq(recipeComments.userId, user.id))
        .where(
          and(
            eq(recipeComments.isActive, true),
            eq(recipeComments.recipeId, input.recipeId),
            inArray(recipeComments.parentId, commentIds),
          ),
        )
        .orderBy(recipeComments.createdAt)

      const repliesByParent = new Map<string, Array<(typeof replies)[number]>>()
      for (const reply of replies) {
        if (reply.comment.parentId) {
          const existing = repliesByParent.get(reply.comment.parentId) ?? []
          existing.push(reply)
          repliesByParent.set(reply.comment.parentId, existing)
        }
      }

      return topLevel.map((item) => ({
        ...item,
        replies: repliesByParent.get(item.comment.id) ?? [],
      }))
    }),

  createRecipeComment: protectedProcedure
    .input(createRecipeCommentSchema)
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit({
        db: ctx.db,
        key: clientRateLimitKey(ctx.headers, "comments.createRecipe", ctx.session.user.id),
        limit: 10,
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

      if (input.parentId) {
        const [parent] = await ctx.db
          .select({ id: recipeComments.id })
          .from(recipeComments)
          .where(
            and(
              eq(recipeComments.id, input.parentId),
              eq(recipeComments.recipeId, input.recipeId),
              eq(recipeComments.isActive, true),
              isNull(recipeComments.parentId),
            ),
          )
          .limit(1)
        if (!parent) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid parent comment." })
        }
      }

      const [comment] = await ctx.db
        .insert(recipeComments)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning()

      return comment
    }),

  updateRecipeComment: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .update(recipeComments)
        .set({ content: input.content })
        .where(and(eq(recipeComments.id, input.id), eq(recipeComments.userId, ctx.session.user.id)))
        .returning()

      return comment
    }),

  deleteRecipeComment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recipeComments)
        .set({ isActive: false })
        .where(and(eq(recipeComments.id, input.id), eq(recipeComments.userId, ctx.session.user.id)))

      return { success: true }
    }),

  wineComments: publicProcedure
    .input(
      z.object({
        wineId: z.string().uuid(),
        limit: z.number().int().min(1).max(50).default(20),
        offset: z.number().int().min(0).max(10_000).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [wine] = await ctx.db
        .select({ id: wines.id })
        .from(wines)
        .where(and(eq(wines.id, input.wineId), eq(wines.published, true)))
        .limit(1)
      if (!wine) return []

      const topLevel = await ctx.db
        .select({
          comment: wineComments,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(wineComments)
        .innerJoin(user, eq(wineComments.userId, user.id))
        .where(
          and(
            eq(wineComments.wineId, input.wineId),
            eq(wineComments.isActive, true),
            isNull(wineComments.parentId),
          ),
        )
        .orderBy(desc(wineComments.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const commentIds = topLevel.map((c) => c.comment.id)
      if (commentIds.length === 0) return []

      const replies = await ctx.db
        .select({
          comment: wineComments,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(wineComments)
        .innerJoin(user, eq(wineComments.userId, user.id))
        .where(
          and(
            eq(wineComments.isActive, true),
            eq(wineComments.wineId, input.wineId),
            inArray(wineComments.parentId, commentIds),
          ),
        )
        .orderBy(wineComments.createdAt)

      const repliesByParent = new Map<string, Array<(typeof replies)[number]>>()
      for (const reply of replies) {
        if (reply.comment.parentId) {
          const existing = repliesByParent.get(reply.comment.parentId) ?? []
          existing.push(reply)
          repliesByParent.set(reply.comment.parentId, existing)
        }
      }

      return topLevel.map((item) => ({
        ...item,
        replies: repliesByParent.get(item.comment.id) ?? [],
      }))
    }),

  createWineComment: protectedProcedure
    .input(createWineCommentSchema)
    .mutation(async ({ ctx, input }) => {
      await enforceRateLimit({
        db: ctx.db,
        key: clientRateLimitKey(ctx.headers, "comments.createWine", ctx.session.user.id),
        limit: 10,
        windowMs: 60_000,
      })

      const [wine] = await ctx.db
        .select({ id: wines.id })
        .from(wines)
        .where(and(eq(wines.id, input.wineId), eq(wines.published, true)))
        .limit(1)
      if (!wine) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Wine not found." })
      }

      if (input.parentId) {
        const [parent] = await ctx.db
          .select({ id: wineComments.id })
          .from(wineComments)
          .where(
            and(
              eq(wineComments.id, input.parentId),
              eq(wineComments.wineId, input.wineId),
              eq(wineComments.isActive, true),
              isNull(wineComments.parentId),
            ),
          )
          .limit(1)
        if (!parent) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid parent comment." })
        }
      }

      const [comment] = await ctx.db
        .insert(wineComments)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning()

      return comment
    }),

  updateWineComment: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .update(wineComments)
        .set({ content: input.content })
        .where(and(eq(wineComments.id, input.id), eq(wineComments.userId, ctx.session.user.id)))
        .returning()

      return comment
    }),

  deleteWineComment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(wineComments)
        .set({ isActive: false })
        .where(and(eq(wineComments.id, input.id), eq(wineComments.userId, ctx.session.user.id)))

      return { success: true }
    }),
} satisfies TRPCRouterRecord
