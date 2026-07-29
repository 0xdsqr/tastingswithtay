import { randomUUID } from "node:crypto"
import type { ManagedAssetFolder } from "@twt/core/images/policy"
import { getBucketName, publicUrlForKey, putManagedObject } from "@twt/core/storage/s3"
import { db } from "@twt/database/client"
import { adminAuditLog } from "@twt/database/schema"
import { setSpanAttributes, withSpan } from "@twt/core/telemetry/tracing"
import sharp from "sharp"
import type { SessionUser } from "./admin-access"
import type { ManagedImageAsset } from "./admin-assets"

// Server-only module: sharp must never reach the client bundle, so this lives
// apart from the server-fn module the UI imports.

const allowedImageTypes = new Set(["image/avif", "image/jpeg", "image/png", "image/webp"])

export const maxUploadBytes = 10 * 1024 * 1024
const maxDecodedPixels = 24_000_000

export class UnsupportedImageError extends Error {}

function sanitizeFileName(fileName: string): string {
  const [rawName = "image"] = fileName.trim().split(".")
  const name = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

  return name || "image"
}

function keyForUpload(folder: ManagedAssetFolder, fileName: string): string {
  return `${folder}/${sanitizeFileName(fileName)}-${randomUUID()}.webp`
}

function requireActorId(user: SessionUser): string {
  if (!user.id) throw new Error("Authenticated admin has no user id.")
  return user.id
}

/**
 * Validates, re-encodes (EXIF-rotated, resized, WebP), stores, and audits an
 * uploaded image. Used by the multipart upload API route.
 */
export async function processAndStoreImage(options: {
  actor: SessionUser
  folder: ManagedAssetFolder
  fileName: string
  contentType: string
  bytes: Uint8Array
}): Promise<ManagedImageAsset> {
  return withSpan(
    "admin.image.upload",
    {
      "twt.image.folder": options.folder,
      "twt.image.source_type": options.contentType,
      "twt.image.source_bytes": options.bytes.byteLength,
    },
    () => storeImage(options),
  )
}

async function storeImage(options: {
  actor: SessionUser
  folder: ManagedAssetFolder
  fileName: string
  contentType: string
  bytes: Uint8Array
}): Promise<ManagedImageAsset> {
  if (options.contentType === "image/heic" || options.contentType === "image/heif") {
    throw new UnsupportedImageError(
      "HEIC photos are not supported yet. On iPhone, share or export the photo as JPEG (Settings → Camera → Formats → Most Compatible), then upload again.",
    )
  }
  if (!allowedImageTypes.has(options.contentType)) {
    throw new UnsupportedImageError("Upload a JPG, PNG, WebP, or AVIF image.")
  }
  if (options.bytes.byteLength > maxUploadBytes) {
    throw new UnsupportedImageError("Image uploads must be 10 MB or smaller.")
  }

  const image = sharp(options.bytes, { limitInputPixels: maxDecodedPixels, animated: false })
  const metadata = await image.metadata()

  if (!metadata.format || !["avif", "jpeg", "png", "webp"].includes(metadata.format)) {
    throw new UnsupportedImageError("The file contents are not a supported image.")
  }
  if ((metadata.pages ?? 1) !== 1) {
    throw new UnsupportedImageError("Animated or multi-page images are not supported.")
  }

  const processed = await image
    .rotate()
    .resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toBuffer()

  const key = keyForUpload(options.folder, options.fileName)
  setSpanAttributes({ "twt.image.stored_bytes": processed.byteLength, "twt.image.key": key })
  await putManagedObject({ key, body: processed, contentType: "image/webp" })

  await db.insert(adminAuditLog).values({
    actorUserId: requireActorId(options.actor),
    action: "asset.upload",
    targetType: "asset",
    targetId: key,
    metadata: {
      sourceType: options.contentType,
      sourceBytes: options.bytes.byteLength,
      storedBytes: processed.byteLength,
    },
  })

  return {
    key,
    url: publicUrlForKey(key),
    bucket: getBucketName(),
    size: processed.byteLength,
    lastModified: new Date().toISOString(),
  }
}
