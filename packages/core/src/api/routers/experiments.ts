import type { TRPCRouterRecord } from "@trpc/server"
import { experimentEntries, experiments, experimentTags, tags } from "@twt/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const experimentsRouter = {
  list: publicProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { status, limit = 20, offset = 0 } = input ?? {}

      const conditions = [eq(experiments.published, true)]
      if (status) {
        conditions.push(eq(experiments.status, status))
      }

      return ctx.db
        .select()
        .from(experiments)
        .where(and(...conditions))
        .orderBy(desc(experiments.updatedAt))
        .limit(limit)
        .offset(offset)
    }),

  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const [experiment] = await ctx.db
      .select()
      .from(experiments)
      .where(and(eq(experiments.slug, input.slug), eq(experiments.published, true)))
      .limit(1)

    if (!experiment) return null

    const entries = await ctx.db
      .select()
      .from(experimentEntries)
      .where(eq(experimentEntries.experimentId, experiment.id))
      .orderBy(desc(experimentEntries.createdAt))

    const experimentTagsResult = await ctx.db
      .select({ tag: tags })
      .from(experimentTags)
      .innerJoin(tags, eq(experimentTags.tagId, tags.id))
      .where(eq(experimentTags.experimentId, experiment.id))

    return {
      ...experiment,
      entries,
      tags: experimentTagsResult.map((r) => r.tag),
    }
  }),

  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(experiments)
      .where(and(eq(experiments.published, true), eq(experiments.featured, true)))
      .orderBy(desc(experiments.updatedAt))
      .limit(6)
  }),

  statusCounts: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        status: experiments.status,
        count: sql<number>`count(*)::int`,
      })
      .from(experiments)
      .where(eq(experiments.published, true))
      .groupBy(experiments.status)

    return result
  }),
} satisfies TRPCRouterRecord
