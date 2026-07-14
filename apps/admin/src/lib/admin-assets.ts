import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { createServerFn } from "@tanstack/react-start"
import { Buffer } from "node:buffer"
import { randomUUID } from "node:crypto"
import { sql } from "@twt/db"
import { db } from "@twt/db/client"
import { adminAuditLog } from "@twt/db/schema"
import sharp from "sharp"
import { z } from "zod"
import { getAdminSessionUser, type SessionUser } from "./admin-access"

const managedAssetFolderEnum = [
  "about",
  "recipes",
  "wines",
  "experiments",
  "gallery",
  "brand",
  "system",
  "uploads",
] as const

const allowedImageTypes = new Set(["image/avif", "image/jpeg", "image/png", "image/webp"])

const maxUploadBytes = 10 * 1024 * 1024
const maxDecodedPixels = 24_000_000

const managedAssetFolders = new Set<string>(managedAssetFolderEnum)

const uploadAssetSchema = z.object({
  folder: z.enum(managedAssetFolderEnum),
  fileName: z.string().min(1).max(240),
  contentType: z.string().min(1).max(120),
  bytesBase64: z.string().min(1),
})

const listAssetSchema = z
  .object({
    folder: z.enum(["all", ...managedAssetFolderEnum]).default("all"),
    limit: z.number().int().min(1).max(250).default(100),
  })
  .optional()

const deleteAssetSchema = z.object({
  key: z.string().min(1).max(512),
})

export type ManagedAssetFolder = (typeof managedAssetFolderEnum)[number]

export type ManagedImageAsset = {
  key: string
  url: string
  bucket: string
  size: number
  lastModified: string | null
}

export type UploadManagedAssetResult =
  | { ok: true; asset: ManagedImageAsset }
  | { ok: false; error: string }

async function requireAdminUser(): Promise<SessionUser> {
  const user = await getAdminSessionUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

function getS3Endpoint(): string | undefined {
  const endpoint = process.env.S3_ENDPOINT?.trim()
  if (!endpoint) return undefined

  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint
  }

  return `${process.env.S3_USE_SSL === "true" ? "https" : "http"}://${endpoint}`
}

function getBucketName(): string {
  return process.env.S3_BUCKET?.trim() || "tastingswithtay"
}

let s3Client: S3Client | undefined

function getS3Client(): S3Client {
  if (s3Client) return s3Client
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim()
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim()

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Set S3_ACCESS_KEY and S3_SECRET_KEY before using image uploads.")
  }

  s3Client = new S3Client({
    endpoint: getS3Endpoint(),
    region: process.env.S3_REGION || "us-east-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    requestHandler: {
      requestTimeout: 10_000,
      connectionTimeout: 3_000,
    },
  })
  return s3Client
}

function encodeKeyPath(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/")
}

function publicUrlForKey(key: string): string {
  return `/${encodeKeyPath(key)}`
}

function sanitizeFileName(fileName: string): string {
  const [rawName = "image", ...extensionParts] = fileName.trim().split(".")
  const extension = extensionParts
    .at(-1)
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "")
  const name = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

  return `${name || "image"}${extension ? `.${extension}` : ""}`
}

function keyForUpload(folder: ManagedAssetFolder, fileName: string): string {
  const safeName = sanitizeFileName(fileName).replace(/\.[^.]+$/, "")
  return `${folder}/${safeName}-${randomUUID()}.webp`
}

function assertSafeKey(key: string): void {
  const [folder, fileName, ...rest] = key.split("/")
  if (
    rest.length > 0 ||
    !folder ||
    !fileName ||
    !managedAssetFolders.has(folder) ||
    fileName.includes("..") ||
    fileName.includes("\\")
  ) {
    throw new Error("Invalid image key.")
  }
}

function keyForManagedImage(
  folder: string | undefined,
  fileName: string | undefined,
): string | null {
  if (!folder || !fileName || !managedAssetFolders.has(folder)) return null
  if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) return null

  return `${folder}/${fileName}`
}

function mapObjectToAsset(
  object: { Key?: string; Size?: number; LastModified?: Date },
  bucket: string,
): ManagedImageAsset | null {
  if (!object.Key) return null

  return {
    key: object.Key,
    url: publicUrlForKey(object.Key),
    bucket,
    size: object.Size ?? 0,
    lastModified: object.LastModified?.toISOString() ?? null,
  }
}

function errorCodeFor(error: unknown): string {
  if (error instanceof Error) return error.name
  if (typeof error === "object" && error && "name" in error && typeof error.name === "string") {
    return error.name
  }

  return "UnknownError"
}

function errorMessageFor(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return "Unknown storage error"
}

function statusCodeFor(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error &&
    "$metadata" in error &&
    typeof error.$metadata === "object" &&
    error.$metadata &&
    "httpStatusCode" in error.$metadata &&
    typeof error.$metadata.httpStatusCode === "number"
  ) {
    return error.$metadata.httpStatusCode
  }

  return undefined
}

function uploadFailure(error: unknown, context: Record<string, unknown>): UploadManagedAssetResult {
  const code = errorCodeFor(error)
  const message = errorMessageFor(error)
  const statusCode = statusCodeFor(error)
  const endpoint = getS3Endpoint() ?? "default AWS endpoint"
  const bucket = getBucketName()

  console.error("[admin-assets] RustFS upload failed", {
    bucket,
    endpoint,
    errorCode: code,
    statusCode,
    error: message,
    ...context,
    hasAccessKey: Boolean(process.env.S3_ACCESS_KEY?.trim()),
    hasSecretKey: Boolean(process.env.S3_SECRET_KEY?.trim()),
  })

  return {
    ok: false,
    error: "The image could not be uploaded. Check the file and try again.",
  }
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

export const uploadManagedAsset = createServerFn({ method: "POST" })
  .validator(uploadAssetSchema)
  .handler(async ({ data }) => {
    try {
      const actor = await requireAdminUser()

      if (!allowedImageTypes.has(data.contentType)) {
        return {
          ok: false,
          error: "Upload a JPG, PNG, WebP, or AVIF image.",
        } satisfies UploadManagedAssetResult
      }

      if (data.bytesBase64.length > Math.ceil((maxUploadBytes * 4) / 3) + 4) {
        return { ok: false, error: "Image uploads must be 10 MB or smaller." }
      }
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data.bytesBase64)) {
        return { ok: false, error: "The uploaded image data is invalid." }
      }

      const body = Buffer.from(data.bytesBase64, "base64")
      if (body.byteLength > maxUploadBytes) {
        return {
          ok: false,
          error: "Image uploads must be 10 MB or smaller.",
        } satisfies UploadManagedAssetResult
      }

      const bucket = getBucketName()
      const client = getS3Client()
      const key = keyForUpload(data.folder, data.fileName)
      const image = sharp(body, { limitInputPixels: maxDecodedPixels, animated: false })
      const metadata = await image.metadata()

      if (!metadata.format || !["avif", "jpeg", "png", "webp"].includes(metadata.format)) {
        return { ok: false, error: "The file contents are not a supported image." }
      }
      if ((metadata.pages ?? 1) !== 1) {
        return { ok: false, error: "Animated or multi-page images are not supported." }
      }

      const processed = await image
        .rotate()
        .resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84, effort: 5 })
        .toBuffer()

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: processed,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      )

      await db.insert(adminAuditLog).values({
        actorUserId: requireActorId(actor),
        action: "asset.upload",
        targetType: "asset",
        targetId: key,
        metadata: {
          sourceType: data.contentType,
          sourceBytes: body.byteLength,
          storedBytes: processed.byteLength,
        },
      })

      const asset = {
        key,
        url: publicUrlForKey(key),
        bucket,
        size: processed.byteLength,
        lastModified: new Date().toISOString(),
      } satisfies ManagedImageAsset

      return { ok: true, asset } satisfies UploadManagedAssetResult
    } catch (error) {
      return uploadFailure(error, {
        folder: data.folder,
        fileName: data.fileName,
        contentType: data.contentType,
      })
    }
  })

export const listManagedAssets = createServerFn({ method: "GET" })
  .validator(listAssetSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

    const bucket = getBucketName()
    const client = getS3Client()
    const folder = data?.folder ?? "all"
    const prefix = folder === "all" ? undefined : `${folder}/`

    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: data?.limit ?? 100,
      }),
    )

    return (response.Contents ?? [])
      .map((object) => mapObjectToAsset(object, bucket))
      .filter((asset): asset is ManagedImageAsset => Boolean(asset))
      .sort((left, right) => {
        const leftTime = left.lastModified ? new Date(left.lastModified).getTime() : 0
        const rightTime = right.lastModified ? new Date(right.lastModified).getTime() : 0
        return rightTime - leftTime
      })
  })

export const deleteManagedAsset = createServerFn({ method: "POST" })
  .validator(deleteAssetSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()
    assertSafeKey(data.key)
    await assertAssetIsUnreferenced(data.key)

    const bucket = getBucketName()
    const client = getS3Client()

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: data.key }))

    await db.insert(adminAuditLog).values({
      actorUserId: requireActorId(actor),
      action: "asset.delete",
      targetType: "asset",
      targetId: data.key,
      metadata: {},
    })

    return { success: true, key: data.key }
  })

export async function getManagedImage(
  folder: string | undefined,
  fileName: string | undefined,
): Promise<{
  body: ReadableStream
  contentType: string
  contentLength?: number
  etag?: string
  lastModified?: Date
} | null> {
  const key = keyForManagedImage(folder, fileName)
  if (!key) return null

  try {
    const bucket = getBucketName()
    const client = getS3Client()

    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

    if (!response.Body) return null

    return {
      body: response.Body.transformToWebStream(),
      contentType: response.ContentType || "image/jpeg",
      contentLength: response.ContentLength,
      etag: response.ETag,
      lastModified: response.LastModified,
    }
  } catch (error) {
    console.error("[admin-assets] RustFS image fetch failed", {
      bucket: getBucketName(),
      key,
      errorCode: error instanceof Error ? error.name : "UnknownError",
      error: error instanceof Error ? error.message : "Unknown storage error",
    })
    return null
  }
}

export async function getManagedImageMetadata(
  folder: string | undefined,
  fileName: string | undefined,
): Promise<{
  contentType: string
  contentLength?: number
  etag?: string
  lastModified?: Date
} | null> {
  const key = keyForManagedImage(folder, fileName)
  if (!key) return null

  try {
    const response = await getS3Client().send(
      new HeadObjectCommand({ Bucket: getBucketName(), Key: key }),
    )
    return {
      contentType: response.ContentType || "image/jpeg",
      contentLength: response.ContentLength,
      etag: response.ETag,
      lastModified: response.LastModified,
    }
  } catch {
    return null
  }
}
