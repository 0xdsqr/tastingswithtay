import type { TRPCRouterRecord } from "@trpc/server"
import {
  createExperimentEntrySchema,
  createExperimentSchema,
  experimentEntries,
  experiments,
  experimentTags,
  tags,
  updateExperimentEntrySchema,
  updateExperimentSchema,
} from "@twt/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { adminProcedure, publicProcedure } from "../trpc"

export const experimentsRouter = {
  // Public: Get all published experiments
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

      const result = await ctx.db
        .select()
        .from(experiments)
        .where(and(...conditions))
        .orderBy(desc(experiments.updatedAt))
        .limit(limit)
        .offset(offset)

      return result
    }),

  // Public: Get experiment by slug (with entries)
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [experiment] = await ctx.db
        .select()
        .from(experiments)
        .where(
          and(
            eq(experiments.slug, input.slug),
            eq(experiments.published, true),
          ),
        )
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

  // Public: Get featured experiments
  featured: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select()
      .from(experiments)
      .where(
        and(eq(experiments.published, true), eq(experiments.featured, true)),
      )
      .orderBy(desc(experiments.updatedAt))
      .limit(6)
  }),

  // Public: Get status counts for filters
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

  // Admin: Get all experiments including drafts
  adminList: adminProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(experiments)
      .orderBy(desc(experiments.updatedAt))

    // Get entry counts for each experiment
    const entryCounts = await ctx.db
      .select({
        experimentId: experimentEntries.experimentId,
        count: sql<number>`count(*)::int`,
      })
      .from(experimentEntries)
      .groupBy(experimentEntries.experimentId)

    const countMap = new Map(entryCounts.map((e) => [e.experimentId, e.count]))

    return result.map((experiment) => ({
      ...experiment,
      entryCount: countMap.get(experiment.id) ?? 0,
    }))
  }),

  // Admin: Create experiment
  create: adminProcedure
    .input(createExperimentSchema)
    .mutation(async ({ ctx, input }) => {
      const [experiment] = await ctx.db
        .insert(experiments)
        .values(input)
        .returning()
      return experiment
    }),

  // Admin: Update experiment
  update: adminProcedure
    .input(z.object({ id: z.string().uuid(), data: updateExperimentSchema }))
    .mutation(async ({ ctx, input }) => {
      const cleanData = Object.fromEntries(
        Object.entries(input.data as Record<string, unknown>).filter(
          ([_, v]) => v !== undefined,
        ),
      )

      const [experiment] = await ctx.db
        .update(experiments)
        .set(cleanData)
        .where(eq(experiments.id, input.id))
        .returning()

      return experiment
    }),

  // Admin: Delete experiment
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(experiments).where(eq(experiments.id, input.id))
      return { success: true }
    }),

  // Admin: Get entries for an experiment
  entries: adminProcedure
    .input(z.object({ experimentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(experimentEntries)
        .where(eq(experimentEntries.experimentId, input.experimentId))
        .orderBy(desc(experimentEntries.createdAt))
    }),

  // Admin: Create entry
  createEntry: adminProcedure
    .input(createExperimentEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const [entry] = await ctx.db
        .insert(experimentEntries)
        .values(input)
        .returning()

      // Touch the experiment's updatedAt
      await ctx.db
        .update(experiments)
        .set({ updatedAt: new Date() })
        .where(eq(experiments.id, input.experimentId))

      return entry
    }),

  // Admin: Update entry
  updateEntry: adminProcedure
    .input(
      z.object({ id: z.string().uuid(), data: updateExperimentEntrySchema }),
    )
    .mutation(async ({ ctx, input }) => {
      const cleanData = Object.fromEntries(
        Object.entries(input.data as Record<string, unknown>).filter(
          ([_, v]) => v !== undefined,
        ),
      )

      const [entry] = await ctx.db
        .update(experimentEntries)
        .set(cleanData)
        .where(eq(experimentEntries.id, input.id))
        .returning()

      return entry
    }),

  // Admin: Delete entry
  deleteEntry: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(experimentEntries)
        .where(eq(experimentEntries.id, input.id))
      return { success: true }
    }),
} satisfies TRPCRouterRecord
