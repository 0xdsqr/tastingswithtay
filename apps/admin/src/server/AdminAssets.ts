import type { DatabaseError, StorageError } from "@twt/core/domain/errors"
import type { ManagedAssetFolder } from "@twt/core/images/policy"
import { Database } from "@twt/core/services/Database"
import { Storage, isSafeManagedKey, publicUrlForKey } from "@twt/core/services/Storage"
import { sql } from "@twt/database"
import { adminAuditLog } from "@twt/database/schema"
import { Context, DateTime, Effect, Layer } from "effect"
import { randomUUID } from "node:crypto"
import { CurrentAdmin } from "./AdminAccess"
import { AdminError } from "./errors"
import { detectSupportedImageType } from "../lib/image-file"

export const maxUploadBytes = 10 * 1024 * 1024
const maxDecodedPixels = 24_000_000

export type ManagedImageAsset = {
  key: string
  url: string
  bucket: string
  size: number
  lastModified: string | null
}

export type ManagedImageAssetPage = {
  assets: Array<ManagedImageAsset>
  nextCursor: string | null
}

type Failure = AdminError | DatabaseError | StorageError

const sanitizeFileName = (fileName: string): string => {
  const [rawName = "image"] = fileName.trim().split(".")
  const name = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
  return name || "image"
}

const unsupported = new AdminError({ message: "The file contents are not a supported image." })

/**
 * Re-encodes an upload to WebP: EXIF-rotated, bounded in size, and stripped of
 * metadata. Originals are never stored, because only this step removes
 * EXIF/GPS data — if sharp cannot load, the upload fails.
 */
const reencode = Effect.fn("AdminAssets.reencode")(function* (bytes: Uint8Array) {
  const sharp = yield* Effect.tryPromise({
    try: () => import("sharp").then((module) => module.default),
    catch: () =>
      new AdminError({ message: "Image processing is temporarily unavailable. Try again later." }),
  }).pipe(Effect.tapError(() => Effect.logError("sharp could not be loaded; upload rejected")))

  return yield* Effect.tryPromise({
    try: async () => {
      const image = sharp(bytes, { limitInputPixels: maxDecodedPixels, animated: false })
      const metadata = await image.metadata()
      if (!metadata.format || !["avif", "jpeg", "png", "webp"].includes(metadata.format)) {
        throw unsupported
      }
      if ((metadata.pages ?? 1) !== 1) {
        throw new AdminError({ message: "Animated or multi-page images are not supported." })
      }
      return new Uint8Array(
        await image
          .rotate()
          .resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 84, effort: 5 })
          .toBuffer(),
      )
    },
    catch: (cause) => (cause instanceof AdminError ? cause : unsupported),
  })
})

/** The managed image library: browse, upload, and delete objects in the bucket. */
export class AdminAssets extends Context.Service<
  AdminAssets,
  {
    list(options: {
      readonly folder: ManagedAssetFolder | "all"
      readonly limit: number
      readonly cursor: string | undefined
    }): Effect.Effect<ManagedImageAssetPage, StorageError>
    /** Deletes an object unless site content still points at it. */
    delete(key: string): Effect.Effect<{ success: true; key: string }, Failure, CurrentAdmin>
    upload(options: {
      readonly folder: ManagedAssetFolder
      readonly fileName: string
      readonly contentType: string
      readonly bytes: Uint8Array
    }): Effect.Effect<ManagedImageAsset, Failure, CurrentAdmin>
  }
>()("admin/server/AdminAssets") {
  static readonly layerNoDeps = Layer.effect(
    AdminAssets,
    Effect.gen(function* () {
      const database = yield* Database
      const storage = yield* Storage

      const recordAudit = (
        actorUserId: string,
        action: string,
        targetId: string,
        metadata: Record<string, unknown>,
      ) =>
        database.query(`admin.audit.${action}`, (db) =>
          db
            .insert(adminAuditLog)
            .values({ actorUserId, action, targetType: "asset", targetId, metadata }),
        )

      const list = Effect.fn("AdminAssets.list")(function* (options: {
        readonly folder: ManagedAssetFolder | "all"
        readonly limit: number
        readonly cursor: string | undefined
      }) {
        const page = yield* storage.list({
          prefix: options.folder === "all" ? undefined : `${options.folder}/`,
          limit: options.limit,
          continuationToken: options.cursor,
        })
        const assets = page.objects
          .map((object) => ({
            key: object.key,
            url: publicUrlForKey(object.key),
            bucket: storage.bucket,
            size: object.size,
            lastModified: object.lastModified,
          }))
          .sort((left, right) => (right.lastModified ?? "").localeCompare(left.lastModified ?? ""))

        return { assets, nextCursor: page.nextToken }
      })

      const deleteAsset = Effect.fn("AdminAssets.delete")(function* (key: string) {
        const actor = yield* CurrentAdmin
        if (!isSafeManagedKey(key)) return yield* new AdminError({ message: "Invalid image key." })

        const publicPath = publicUrlForKey(key)
        const result = yield* database.query("admin.assets.references", (db) =>
          db.execute<{ referenced: boolean }>(sql`
            SELECT EXISTS (
              SELECT 1 FROM recipes WHERE image = ${publicPath}
              UNION ALL SELECT 1 FROM wines WHERE image = ${publicPath}
              UNION ALL SELECT 1 FROM experiments WHERE image = ${publicPath}
              UNION ALL SELECT 1 FROM gallery_images WHERE image = ${publicPath}
              UNION ALL SELECT 1 FROM experiment_entries WHERE images @> jsonb_build_array(${publicPath}::text)
              UNION ALL SELECT 1 FROM site_settings WHERE value::text LIKE ${`%${publicPath}%`}
            ) AS referenced
          `),
        )
        if (result.rows[0]?.referenced) {
          return yield* new AdminError({
            message: "This image is still referenced by site content and cannot be deleted.",
          })
        }

        yield* storage.delete(key)
        yield* recordAudit(actor.id, "asset.delete", key, {})
        return { success: true as const, key }
      })

      const upload = Effect.fn("AdminAssets.upload")(function* (options: {
        readonly folder: ManagedAssetFolder
        readonly fileName: string
        readonly contentType: string
        readonly bytes: Uint8Array
      }) {
        const actor = yield* CurrentAdmin
        if (options.bytes.byteLength > maxUploadBytes) {
          return yield* new AdminError({ message: "Image uploads must be 10 MB or smaller." })
        }
        // The file signature decides the type; the client-supplied MIME type is never trusted.
        if (!detectSupportedImageType(options.bytes)) {
          return yield* options.contentType === "image/heic" || options.contentType === "image/heif"
            ? new AdminError({
                message:
                  "HEIC photos are not supported yet. On iPhone, share or export the photo as JPEG (Settings → Camera → Formats → Most Compatible), then upload again.",
              })
            : unsupported
        }

        const stored = yield* reencode(options.bytes)
        // Keys must be unguessable, so they use the OS CSPRNG rather than Effect's seedable Random.
        const key = `${options.folder}/${sanitizeFileName(options.fileName)}-${randomUUID()}.webp`
        yield* Effect.annotateCurrentSpan({
          "twt.image.folder": options.folder,
          "twt.image.key": key,
          "twt.image.source_bytes": options.bytes.byteLength,
          "twt.image.stored_bytes": stored.byteLength,
        })

        yield* storage.put({ key, body: stored, contentType: "image/webp" })
        yield* recordAudit(actor.id, "asset.upload", key, {
          sourceType: options.contentType,
          sourceBytes: options.bytes.byteLength,
          storedType: "image/webp",
          storedBytes: stored.byteLength,
        })

        return {
          key,
          url: publicUrlForKey(key),
          bucket: storage.bucket,
          size: stored.byteLength,
          lastModified: DateTime.formatIso(yield* DateTime.now),
        }
      })

      return AdminAssets.of({ list, delete: deleteAsset, upload })
    }),
  )
}
