import type { TRPCRouterRecord } from "@trpc/server"
import {
  createRecipeCommentSchema,
  createWineCommentSchema,
  recipeComments,
  user,
  wineComments,
} from "@twt/db/schema"
import { and, desc, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, protectedProcedure, publicProcedure } from "../trpc"

export const commentsRouter = {
  // ============================================
  // RECIPE COMMENTS
  // ============================================

  // Public: Get comments for a recipe (top-level only, with nested replies)
  recipeComments: publicProcedure
    .input(
      z.object({
        recipeId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get top-level comments with user info
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

      // Get replies for these comments
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
            // Note: we'd need to use inArray here but keeping simple for now
            eq(recipeComments.recipeId, input.recipeId),
          ),
        )
        .orderBy(recipeComments.createdAt)

      // Build nested structure
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

  // Protected: Create recipe comment
  createRecipeComment: protectedProcedure
    .input(createRecipeCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .insert(recipeComments)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning()

      return comment
    }),

  // Protected: Update own comment
  updateRecipeComment: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .update(recipeComments)
        .set({ content: input.content })
        .where(
          and(
            eq(recipeComments.id, input.id),
            eq(recipeComments.userId, ctx.session.user.id),
          ),
        )
        .returning()

      return comment
    }),

  // Protected: Delete own comment (soft delete)
  deleteRecipeComment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(recipeComments)
        .set({ isActive: false })
        .where(
          and(
            eq(recipeComments.id, input.id),
            eq(recipeComments.userId, ctx.session.user.id),
          ),
        )

      return { success: true }
    }),

  // Admin: Hard delete any comment
  adminDeleteRecipeComment: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(recipeComments).where(eq(recipeComments.id, input.id))
      return { success: true }
    }),

  // ============================================
  // WINE COMMENTS
  // ============================================

  // Public: Get comments for a wine
  wineComments: publicProcedure
    .input(
      z.object({
        wineId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
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

  // Protected: Create wine comment
  createWineComment: protectedProcedure
    .input(createWineCommentSchema)
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .insert(wineComments)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning()

      return comment
    }),

  // Protected: Update own comment
  updateWineComment: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .update(wineComments)
        .set({ content: input.content })
        .where(
          and(
            eq(wineComments.id, input.id),
            eq(wineComments.userId, ctx.session.user.id),
          ),
        )
        .returning()

      return comment
    }),

  // Protected: Delete own comment (soft delete)
  deleteWineComment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(wineComments)
        .set({ isActive: false })
        .where(
          and(
            eq(wineComments.id, input.id),
            eq(wineComments.userId, ctx.session.user.id),
          ),
        )

      return { success: true }
    }),

  // Admin: Hard delete any comment
  adminDeleteWineComment: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(wineComments).where(eq(wineComments.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
