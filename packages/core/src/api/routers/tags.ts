import type { TRPCRouterRecord } from "@trpc/server"
import { createTagSchema, tags } from "@twt/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, publicProcedure } from "../trpc"

export const tagsRouter = {
  // Public: Get all tags
  list: publicProcedure
    .input(
      z
        .object({
          type: z.enum(["recipe", "wine", "both"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (input?.type) {
        return ctx.db
          .select()
          .from(tags)
          .where(eq(tags.type, input.type))
          .orderBy(tags.name)
      }
      return ctx.db.select().from(tags).orderBy(tags.name)
    }),

  // Public: Get tag by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [tag] = await ctx.db
        .select()
        .from(tags)
        .where(eq(tags.slug, input.slug))
        .limit(1)

      return tag ?? null
    }),

  // Admin: Create tag
  create: adminProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      const [tag] = await ctx.db.insert(tags).values(input).returning()
      return tag
    }),

  // Admin: Update tag
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: createTagSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [tag] = await ctx.db
        .update(tags)
        .set(input.data)
        .where(eq(tags.id, input.id))
        .returning()

      return tag
    }),

  // Admin: Delete tag
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(tags).where(eq(tags.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
