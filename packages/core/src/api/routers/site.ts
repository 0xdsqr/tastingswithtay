import type { TRPCRouterRecord } from "@trpc/server"
import { siteSettings } from "@twt/db/schema"
import { eq } from "drizzle-orm"
import { publicProcedure } from "../trpc"

const siteDraftSettingKey = "site-draft"

export const siteRouter = {
  draft: publicProcedure.query(async ({ ctx }) => {
    const [setting] = await ctx.db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, siteDraftSettingKey))
      .limit(1)

    return setting?.value ?? null
  }),
} satisfies TRPCRouterRecord
