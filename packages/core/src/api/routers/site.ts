import type { TRPCRouterRecord } from "@trpc/server"
import { siteSettings } from "@twt/database/schema"
import { eq } from "@twt/database"
import { publicProcedure } from "../trpc"

const sitePublicationSettingKey = "site-publication"

export const siteRouter = {
  published: publicProcedure.query(async ({ ctx }) => {
    const [setting] = await ctx.db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, sitePublicationSettingKey))
      .limit(1)

    return setting?.value ?? null
  }),
} satisfies TRPCRouterRecord
