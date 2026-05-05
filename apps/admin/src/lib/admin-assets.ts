import {
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { createServerFn } from "@tanstack/react-start"
import { Buffer } from "node:buffer"
import { z } from "zod"
import { getAdminSessionUser } from "./admin-access"

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

const allowedImageTypes = new Set([
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp",
])

const maxUploadBytes = 10 * 1024 * 1024

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

async function requireAdminUser(): Promise<void> {
  const user = await getAdminSessionUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
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

function getS3Client(): S3Client {
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim()
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim()

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Set S3_ACCESS_KEY and S3_SECRET_KEY before using image uploads.")
  }

  return new S3Client({
    endpoint: getS3Endpoint(),
    region: process.env.S3_REGION || "us-east-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  })
}

async function ensureBucketAccessible(client: S3Client, bucket: string): Promise<void> {
  await client.send(new HeadBucketCommand({ Bucket: bucket }))
}

function encodeKeyPath(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/")
}

function publicUrlForKey(key: string, bucket: string): string {
  const cdnBase = process.env.CDN_BASE?.trim().replace(/\/+$/, "")
  if (cdnBase) {
    return `${cdnBase}/${encodeKeyPath(key)}`
  }

  const endpoint = getS3Endpoint()?.replace(/\/+$/, "")
  if (endpoint) {
    return `${endpoint}/${encodeURIComponent(bucket)}/${encodeKeyPath(key)}`
  }

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
  const safeName = sanitizeFileName(fileName)
  return `${folder}/${Date.now()}-${safeName}`
}

function assertSafeKey(key: string): void {
  if (key.startsWith("/") || key.includes("..") || key.includes("//")) {
    throw new Error("Invalid image key.")
  }
}

function mapObjectToAsset(
  object: { Key?: string; Size?: number; LastModified?: Date },
  bucket: string,
): ManagedImageAsset | null {
  if (!object.Key) return null

  return {
    key: object.Key,
    url: publicUrlForKey(object.Key, bucket),
    bucket,
    size: object.Size ?? 0,
    lastModified: object.LastModified?.toISOString() ?? null,
  }
}

export const uploadManagedAsset = createServerFn({ method: "POST" })
  .inputValidator(uploadAssetSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

    if (!allowedImageTypes.has(data.contentType)) {
      throw new Error("Upload an image file: JPG, PNG, WebP, AVIF, GIF, HEIC, or HEIF.")
    }

    const body = Buffer.from(data.bytesBase64, "base64")
    if (body.byteLength > maxUploadBytes) {
      throw new Error("Image uploads must be 10 MB or smaller.")
    }

    const bucket = getBucketName()
    const client = getS3Client()
    const key = keyForUpload(data.folder, data.fileName)

    await ensureBucketAccessible(client, bucket)
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: data.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    )

    return {
      key,
      url: publicUrlForKey(key, bucket),
      bucket,
      size: body.byteLength,
      lastModified: new Date().toISOString(),
    } satisfies ManagedImageAsset
  })

export const listManagedAssets = createServerFn({ method: "GET" })
  .inputValidator(listAssetSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

    const bucket = getBucketName()
    const client = getS3Client()
    const folder = data?.folder ?? "all"
    const prefix = folder === "all" ? undefined : `${folder}/`

    await ensureBucketAccessible(client, bucket)

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
  .inputValidator(deleteAssetSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()
    assertSafeKey(data.key)

    const bucket = getBucketName()
    const client = getS3Client()

    await ensureBucketAccessible(client, bucket)
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: data.key }))

    return { success: true, key: data.key }
  })
