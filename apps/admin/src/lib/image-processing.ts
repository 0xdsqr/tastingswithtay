import { randomUUID } from "node:crypto"
import type { ManagedAssetFolder } from "@twt/core/images/policy"
import { getBucketName, publicUrlForKey, putManagedObject } from "@twt/core/storage/s3"
import { db } from "@twt/database/client"
import { adminAuditLog } from "@twt/database/schema"
import { setSpanAttributes, withSpan } from "@twt/core/telemetry/tracing"
import type { SessionUser } from "./admin-access"
import type { ManagedImageAsset } from "./admin-assets"
import { detectSupportedImageType } from "./image-file"

// Server-only module: sharp must never reach the client bundle, so this lives
// apart from the server-fn module the UI imports.

export const maxUploadBytes = 10 * 1024 * 1024
const maxDecodedPixels = 24_000_000

export class UnsupportedImageError extends Error {}
export class ImageProcessingUnavailableError extends Error {}

async function loadImageProcessor(): Promise<typeof import("sharp").default> {
  try {
    return (await import("sharp")).default
  } catch (cause) {
    throw new ImageProcessingUnavailableError(
      "Image processing is temporarily unavailable. Try again later.",
      { cause },
    )
  }
}

function sanitizeFileName(fileName: string): string {
  const [rawName = "image"] = fileName.trim().split(".")
  const name = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

  return name || "image"
}

function keyForUpload(
  folder: ManagedAssetFolder,
  fileName: string,
  extension: "avif" | "jpg" | "png" | "webp",
): string {
  return `${folder}/${sanitizeFileName(fileName)}-${randomUUID()}.${extension}`
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
  if (options.bytes.byteLength > maxUploadBytes) {
    throw new UnsupportedImageError("Image uploads must be 10 MB or smaller.")
  }

  const detectedType = detectSupportedImageType(options.bytes)
  if (!detectedType) {
    if (options.contentType === "image/heic" || options.contentType === "image/heif") {
      throw new UnsupportedImageError(
        "HEIC photos are not supported yet. On iPhone, share or export the photo as JPEG (Settings → Camera → Formats → Most Compatible), then upload again.",
      )
    }
    throw new UnsupportedImageError("The file contents are not a supported image.")
  }

  let storedBytes: Uint8Array
  let storedContentType: string
  let storedExtension: "avif" | "jpg" | "png" | "webp"
  let imageWasProcessed = true

  try {
    const sharp = await loadImageProcessor()
    const image = sharp(options.bytes, { limitInputPixels: maxDecodedPixels, animated: false })
    const metadata = await image.metadata()

    if (!metadata.format || !["avif", "jpeg", "png", "webp"].includes(metadata.format)) {
      throw new UnsupportedImageError("The file contents are not a supported image.")
    }
    if ((metadata.pages ?? 1) !== 1) {
      throw new UnsupportedImageError("Animated or multi-page images are not supported.")
    }

    storedBytes = await image
      .rotate()
      .resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toBuffer()
    storedContentType = "image/webp"
    storedExtension = "webp"
  } catch (error) {
    if (!(error instanceof ImageProcessingUnavailableError)) throw error

    imageWasProcessed = false
    storedBytes = options.bytes
    storedContentType = detectedType.contentType
    storedExtension = detectedType.extension
    console.error("[admin-assets] Image processor unavailable; storing validated original", {
      folder: options.folder,
      contentType: detectedType.contentType,
      cause: error.cause,
    })
  }

  const key = keyForUpload(options.folder, options.fileName, storedExtension)
  setSpanAttributes({
    "twt.image.stored_bytes": storedBytes.byteLength,
    "twt.image.key": key,
    "twt.image.processed": imageWasProcessed,
  })
  await putManagedObject({ key, body: storedBytes, contentType: storedContentType })

  await db.insert(adminAuditLog).values({
    actorUserId: requireActorId(options.actor),
    action: "asset.upload",
    targetType: "asset",
    targetId: key,
    metadata: {
      sourceType: options.contentType,
      sourceBytes: options.bytes.byteLength,
      storedType: storedContentType,
      storedBytes: storedBytes.byteLength,
      processed: imageWasProcessed,
    },
  })

  return {
    key,
    url: publicUrlForKey(key),
    bucket: getBucketName(),
    size: storedBytes.byteLength,
    lastModified: new Date().toISOString(),
  }
}
