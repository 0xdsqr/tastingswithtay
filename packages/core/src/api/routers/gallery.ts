import type { TRPCRouterRecord } from "@trpc/server"
import {
  createGalleryImageSchema,
  galleryImages,
  updateGalleryImageSchema,
} from "@twt/db/schema"
import { and, asc, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, publicProcedure } from "../trpc"

export const galleryRouter = {
  // Public: Get all published gallery images
  list: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { category, limit = 50, offset = 0 } = input ?? {}

      const conditions = [eq(galleryImages.published, true)]
      if (category) {
        conditions.push(eq(galleryImages.category, category))
      }

      return ctx.db
        .select()
        .from(galleryImages)
        .where(and(...conditions))
        .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt))
        .limit(limit)
        .offset(offset)
    }),

  // Public: Get category counts
  categoryCounts: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        category: galleryImages.category,
        count: sql<number>`count(*)::int`,
      })
      .from(galleryImages)
      .where(eq(galleryImages.published, true))
      .groupBy(galleryImages.category)

    return result
  }),

  // Admin: Get all images including unpublished
  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(galleryImages)
      .orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt))
  }),

  // Admin: Create image
  create: adminProcedure
    .input(createGalleryImageSchema)
    .mutation(async ({ ctx, input }) => {
      const [image] = await ctx.db
        .insert(galleryImages)
        .values(input)
        .returning()
      return image
    }),

  // Admin: Update image
  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), data: updateGalleryImageSchema }))
    .mutation(async ({ ctx, input }) => {
      const cleanData = Object.fromEntries(
        Object.entries(input.data as Record<string, unknown>).filter(
          ([_, v]) => v !== undefined,
        ),
      )

      const [image] = await ctx.db
        .update(galleryImages)
        .set(cleanData)
        .where(eq(galleryImages.id, input.id))
        .returning()

      return image
    }),

  // Admin: Delete image
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(galleryImages)
        .where(eq(galleryImages.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
