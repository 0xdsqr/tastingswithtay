import type { TRPCRouterRecord } from "@trpc/server"
import {
  createWineSchema,
  tags,
  updateWineSchema,
  wines,
  wineTags,
} from "@twt/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, publicProcedure } from "../trpc"

export const winesRouter = {
  // Public: Get all published wines
  list: publicProcedure
    .input(
      z
        .object({
          type: z.string().optional(),
          country: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { type, country, limit = 20, offset = 0 } = input ?? {}

      const conditions = [eq(wines.published, true)]
      if (type) {
        conditions.push(eq(wines.type, type))
      }
      if (country) {
        conditions.push(eq(wines.country, country))
      }

      const result = await ctx.db
        .select()
        .from(wines)
        .where(and(...conditions))
        .orderBy(desc(wines.createdAt))
        .limit(limit)
        .offset(offset)

      return result
    }),

  // Public: Get wine by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [wine] = await ctx.db
        .select()
        .from(wines)
        .where(and(eq(wines.slug, input.slug), eq(wines.published, true)))
        .limit(1)

      return wine ?? null
    }),

  // Public: Get all wine types
  types: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .selectDistinct({ type: wines.type })
      .from(wines)
      .where(eq(wines.published, true))
      .orderBy(wines.type)

    return result.map((r) => r.type)
  }),

  // Public: Get wine tags
  tags: publicProcedure
    .input(z.object({ wineId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ tag: tags })
        .from(wineTags)
        .innerJoin(tags, eq(wineTags.tagId, tags.id))
        .where(eq(wineTags.wineId, input.wineId))

      return result.map((r) => r.tag)
    }),

  // Public: Get featured wines
  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(wines)
      .where(and(eq(wines.published, true), eq(wines.featured, true)))
      .orderBy(desc(wines.rating))
      .limit(6)
  }),

  // Admin: Get all wines including drafts
  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(wines).orderBy(desc(wines.updatedAt))
  }),

  // Admin: Create wine
  create: adminProcedure
    .input(createWineSchema)
    .mutation(async ({ ctx, input }) => {
      const [wine] = await ctx.db.insert(wines).values(input).returning()
      return wine
    }),

  // Admin: Update wine
  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), data: updateWineSchema }))
    .mutation(async ({ ctx, input }) => {
      const cleanData = Object.fromEntries(
        Object.entries(input.data).filter(([_, v]) => v !== undefined),
      )

      const [wine] = await ctx.db
        .update(wines)
        .set(cleanData)
        .where(eq(wines.id, input.id))
        .returning()

      return wine
    }),

  // Admin: Delete wine
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(wines).where(eq(wines.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
