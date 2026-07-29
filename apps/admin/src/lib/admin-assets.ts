import { createServerFn } from "@tanstack/react-start"
import { managedAssetFolders } from "@twt/core/images/policy"
import {
  assertSafeKey,
  deleteManagedObject,
  getBucketName,
  listManagedObjects,
  publicUrlForKey,
} from "@twt/core/storage/s3"
import { sql } from "@twt/database"
import { db } from "@twt/database/client"
import { adminAuditLog } from "@twt/database/schema"
import { z } from "zod"
import { getAdminSessionUser, type SessionUser } from "./admin-access"

const listAssetSchema = z
  .object({
    folder: z.enum(["all", ...managedAssetFolders]).default("all"),
    limit: z.number().int().min(1).max(250).default(60),
    cursor: z.string().max(2_048).optional(),
  })
  .optional()

const deleteAssetSchema = z.object({
  key: z.string().min(1).max(512),
})

export type ManagedImageAsset = {
  key: string
  url: string
  bucket: string
  size: number
  lastModified: string | null
}

export type ManagedImageAssetPage = {
  assets: ManagedImageAsset[]
  nextCursor: string | null
}

async function requireAdminUser(): Promise<SessionUser> {
  const user = await getAdminSessionUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

function requireActorId(user: SessionUser): string {
  if (!user.id) throw new Error("Authenticated admin has no user id.")
  return user.id
}

async function assertAssetIsUnreferenced(key: string): Promise<void> {
  const publicPath = publicUrlForKey(key)
  const result = await db.execute<{ referenced: boolean }>(sql`
    SELECT EXISTS (
      SELECT 1 FROM recipes WHERE image = ${publicPath}
      UNION ALL SELECT 1 FROM wines WHERE image = ${publicPath}
      UNION ALL SELECT 1 FROM experiments WHERE image = ${publicPath}
      UNION ALL SELECT 1 FROM gallery_images WHERE image = ${publicPath}
      UNION ALL SELECT 1 FROM experiment_entries WHERE images @> jsonb_build_array(${publicPath}::text)
      UNION ALL SELECT 1 FROM site_settings WHERE value::text LIKE ${`%${publicPath}%`}
    ) AS referenced
  `)

  if (result.rows[0]?.referenced) {
    throw new Error("This image is still referenced by site content and cannot be deleted.")
  }
}

export const listManagedAssets = createServerFn({ method: "GET" })
  .validator(listAssetSchema)
  .handler(async ({ data }): Promise<ManagedImageAssetPage> => {
    await requireAdminUser()

    const folder = data?.folder ?? "all"
    const bucket = getBucketName()
    const page = await listManagedObjects({
      prefix: folder === "all" ? undefined : `${folder}/`,
      limit: data?.limit ?? 60,
      continuationToken: data?.cursor,
    })

    const assets = page.objects
      .map((object) => ({
        key: object.key,
        url: publicUrlForKey(object.key),
        bucket,
        size: object.size,
        lastModified: object.lastModified,
      }))
      .sort((left, right) => {
        const leftTime = left.lastModified ? new Date(left.lastModified).getTime() : 0
        const rightTime = right.lastModified ? new Date(right.lastModified).getTime() : 0
        return rightTime - leftTime
      })

    return { assets, nextCursor: page.nextToken }
  })

export const deleteManagedAsset = createServerFn({ method: "POST" })
  .validator(deleteAssetSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()
    assertSafeKey(data.key)
    await assertAssetIsUnreferenced(data.key)

    await deleteManagedObject(data.key)

    await db.insert(adminAuditLog).values({
      actorUserId: requireActorId(actor),
      action: "asset.delete",
      targetType: "asset",
      targetId: data.key,
      metadata: {},
    })

    return { success: true, key: data.key }
  })
