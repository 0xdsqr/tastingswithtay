import type { TRPCRouterRecord } from "@trpc/server"
import { tags } from "@twt/db/schema"
import { eq } from "@twt/db"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const tagsRouter = {
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
        return ctx.db.select().from(tags).where(eq(tags.type, input.type)).orderBy(tags.name)
      }

      return ctx.db.select().from(tags).orderBy(tags.name)
    }),

  bySlug: publicProcedure
    .input(
      z.object({
        slug: z
          .string()
          .min(1)
          .max(100)
          .regex(/^[a-z0-9-]+$/),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [tag] = await ctx.db.select().from(tags).where(eq(tags.slug, input.slug)).limit(1)

      return tag ?? null
    }),
} satisfies TRPCRouterRecord
