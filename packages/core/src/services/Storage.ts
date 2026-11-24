import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { Context, Effect, Layer, Option, Redacted } from "effect"
import { StorageConfig } from "../config"
import { StorageError } from "../domain/errors"
import { isManagedAssetFolder } from "../images/policy"

export type ManagedImageMetadata = {
  readonly contentType: string
  readonly contentLength: number | undefined
  readonly etag: string | undefined
  readonly lastModified: Date | undefined
}

export type ManagedImage = ManagedImageMetadata & { readonly body: ReadableStream }

export type ManagedObjectSummary = {
  readonly key: string
  readonly size: number
  readonly lastModified: string | null
}

export type ManagedObjectPage = {
  readonly objects: ReadonlyArray<ManagedObjectSummary>
  readonly nextToken: string | null
}

const errorName = (cause: unknown): string =>
  cause instanceof Error && cause.name !== "" ? cause.name : "UnknownError"

const isMissingObject = (cause: unknown): boolean => {
  const name = errorName(cause)
  return name === "NoSuchKey" || name === "NotFound"
}

/** Root-relative public path for a bucket key (`folder/file` → `/folder/file`). */
export const publicUrlForKey = (key: string): string =>
  `/${key.split("/").map(encodeURIComponent).join("/")}`

/** The bucket key for `folder/fileName`, or none unless it is a plain file in a managed folder. */
export const managedImageKey = (
  folder: string | undefined,
  fileName: string | undefined,
): Option.Option<string> => {
  if (!folder || !fileName || !isManagedAssetFolder(folder)) return Option.none()
  if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) {
    return Option.none()
  }
  return Option.some(`${folder}/${fileName}`)
}

/** Whether `key` is a plain `folder/file` key inside a managed folder. */
export const isSafeManagedKey = (key: string): boolean => {
  const [folder, fileName, ...rest] = key.split("/")
  return rest.length === 0 && Option.isSome(managedImageKey(folder, fileName))
}

export class Storage extends Context.Service<
  Storage,
  {
    readonly bucket: string
    /** Streams an image, or none when the object does not exist. */
    getImage(key: string): Effect.Effect<Option.Option<ManagedImage>, StorageError>
    getImageMetadata(key: string): Effect.Effect<Option.Option<ManagedImageMetadata>, StorageError>
    list(options: {
      readonly prefix: string | undefined
      readonly limit: number
      readonly continuationToken: string | undefined
    }): Effect.Effect<ManagedObjectPage, StorageError>
    put(options: {
      readonly key: string
      readonly body: Uint8Array
      readonly contentType: string
    }): Effect.Effect<void, StorageError>
    delete(key: string): Effect.Effect<void, StorageError>
  }
>()("@twt/core/services/Storage") {
  static readonly layer = Layer.effect(
    Storage,
    Effect.gen(function* () {
      const config = yield* StorageConfig
      const bucket = config.bucket

      const endpoint = Option.map(config.endpoint, (value) =>
        value.startsWith("http://") || value.startsWith("https://")
          ? value
          : `${config.useSsl ? "https" : "http"}://${value}`,
      )

      // Credentials are checked on first use, so apps that never touch images still start.
      const client = yield* Effect.cached(
        Effect.gen(function* () {
          if (Option.isNone(config.accessKeyId) || Option.isNone(config.secretAccessKey)) {
            return yield* new StorageError({
              operation: "connect",
              key: "",
              reason: "MissingCredentials",
            })
          }
          return new S3Client({
            endpoint: Option.getOrUndefined(endpoint),
            region: config.region,
            credentials: {
              accessKeyId: Redacted.value(config.accessKeyId.value),
              secretAccessKey: Redacted.value(config.secretAccessKey.value),
            },
            forcePathStyle: config.forcePathStyle,
            requestHandler: { requestTimeout: 10_000, connectionTimeout: 3_000 },
          })
        }),
      )

      const send = <A>(operation: string, key: string, run: (client: S3Client) => Promise<A>) =>
        Effect.flatMap(client, (s3) =>
          Effect.tryPromise({
            try: () => run(s3),
            catch: (cause) => cause,
          }),
        ).pipe(Effect.withSpan(`Storage.${operation}`, { attributes: { "twt.storage.key": key } }))

      const failure = (operation: string, key: string) => (cause: unknown) =>
        cause instanceof StorageError
          ? cause
          : new StorageError({ operation, key, reason: errorName(cause) })

      /** Treats a missing object as none and every other failure as a `StorageError`. */
      const optional = <A>(operation: string, key: string, effect: Effect.Effect<A, unknown>) =>
        effect.pipe(
          Effect.map(Option.some),
          Effect.catch((cause) =>
            isMissingObject(cause)
              ? Effect.succeed(Option.none<A>())
              : Effect.fail(failure(operation, key)(cause)),
          ),
          Effect.tapError((error) => Effect.logError("Object storage request failed", error)),
        )

      const getImage = (key: string) =>
        optional(
          "getImage",
          key,
          send("getImage", key, (s3) =>
            s3.send(new GetObjectCommand({ Bucket: bucket, Key: key })),
          ),
        ).pipe(
          Effect.map(
            Option.flatMap((response) =>
              response.Body
                ? Option.some<ManagedImage>({
                    body: response.Body.transformToWebStream(),
                    contentType: response.ContentType || "image/jpeg",
                    contentLength: response.ContentLength,
                    etag: response.ETag,
                    lastModified: response.LastModified,
                  })
                : Option.none(),
            ),
          ),
        )

      const getImageMetadata = (key: string) =>
        optional(
          "getImageMetadata",
          key,
          send("getImageMetadata", key, (s3) =>
            s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key })),
          ),
        ).pipe(
          Effect.map(
            Option.map((response): ManagedImageMetadata => ({
              contentType: response.ContentType || "image/jpeg",
              contentLength: response.ContentLength,
              etag: response.ETag,
              lastModified: response.LastModified,
            })),
          ),
        )

      const list = (options: {
        readonly prefix: string | undefined
        readonly limit: number
        readonly continuationToken: string | undefined
      }) =>
        send("list", options.prefix ?? "", (s3) =>
          s3.send(
            new ListObjectsV2Command({
              Bucket: bucket,
              Prefix: options.prefix,
              MaxKeys: options.limit,
              ContinuationToken: options.continuationToken,
            }),
          ),
        ).pipe(
          Effect.mapError(failure("list", options.prefix ?? "")),
          Effect.map((response): ManagedObjectPage => ({
            objects: (response.Contents ?? []).flatMap((object) =>
              object.Key
                ? [
                    {
                      key: object.Key,
                      size: object.Size ?? 0,
                      lastModified: object.LastModified?.toISOString() ?? null,
                    },
                  ]
                : [],
            ),
            nextToken: response.IsTruncated ? (response.NextContinuationToken ?? null) : null,
          })),
        )

      const put = (options: {
        readonly key: string
        readonly body: Uint8Array
        readonly contentType: string
      }) =>
        send("put", options.key, (s3) =>
          s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: options.key,
              Body: options.body,
              ContentType: options.contentType,
              CacheControl: "public, max-age=31536000, immutable",
            }),
          ),
        ).pipe(Effect.mapError(failure("put", options.key)), Effect.asVoid)

      const deleteObject = (key: string) =>
        send("delete", key, (s3) =>
          s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })),
        ).pipe(Effect.mapError(failure("delete", key)), Effect.asVoid)

      return Storage.of({ bucket, getImage, getImageMetadata, list, put, delete: deleteObject })
    }),
  )
}
