import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { isManagedAssetFolder } from "../images/policy"
import { isMissingObjectError } from "./object-error"

function getS3Endpoint(): string | undefined {
  const endpoint = process.env.S3_ENDPOINT?.trim()
  if (!endpoint) return undefined

  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint
  }

  return `${process.env.S3_USE_SSL === "true" ? "https" : "http"}://${endpoint}`
}

export function getBucketName(): string {
  return process.env.S3_BUCKET?.trim() || "tastingswithtay"
}

let s3Client: S3Client | undefined

export function getS3Client(): S3Client {
  if (s3Client) return s3Client
  const accessKeyId = process.env.S3_ACCESS_KEY?.trim()
  const secretAccessKey = process.env.S3_SECRET_KEY?.trim()

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Set S3_ACCESS_KEY and S3_SECRET_KEY before using managed images.")
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

/** Root-relative public path for a bucket key (`folder/file` → `/folder/file`). */
export function publicUrlForKey(key: string): string {
  return `/${encodeKeyPath(key)}`
}

/** Throws unless `key` is a plain `folder/file` key inside a managed folder. */
export function assertSafeKey(key: string): void {
  const [folder, fileName, ...rest] = key.split("/")
  if (
    rest.length > 0 ||
    !folder ||
    !fileName ||
    !isManagedAssetFolder(folder) ||
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
  if (!folder || !fileName || !isManagedAssetFolder(folder)) return null
  if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) return null

  return `${folder}/${fileName}`
}

export type ManagedImageStream = {
  body: ReadableStream
  contentType: string
  contentLength?: number
  etag?: string
  lastModified?: Date
}

export type ManagedImageMetadata = Omit<ManagedImageStream, "body">

export async function getManagedImage(
  folder: string | undefined,
  fileName: string | undefined,
): Promise<ManagedImageStream | null> {
  const key = keyForManagedImage(folder, fileName)
  if (!key) return null

  try {
    const response = await getS3Client().send(
      new GetObjectCommand({ Bucket: getBucketName(), Key: key }),
    )

    if (!response.Body) return null

    return {
      body: response.Body.transformToWebStream(),
      contentType: response.ContentType || "image/jpeg",
      contentLength: response.ContentLength,
      etag: response.ETag,
      lastModified: response.LastModified,
    }
  } catch (error) {
    if (isMissingObjectError(error)) return null

    console.error("[storage] RustFS image fetch failed", {
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
): Promise<ManagedImageMetadata | null> {
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

export type ManagedObjectSummary = {
  key: string
  size: number
  lastModified: string | null
}

export type ManagedObjectPage = {
  objects: ManagedObjectSummary[]
  nextToken: string | null
}

export async function listManagedObjects(options: {
  prefix?: string
  limit: number
  continuationToken?: string
}): Promise<ManagedObjectPage> {
  const response = await getS3Client().send(
    new ListObjectsV2Command({
      Bucket: getBucketName(),
      Prefix: options.prefix,
      MaxKeys: options.limit,
      ContinuationToken: options.continuationToken,
    }),
  )

  const objects = (response.Contents ?? [])
    .filter((object): object is typeof object & { Key: string } => Boolean(object.Key))
    .map((object) => ({
      key: object.Key,
      size: object.Size ?? 0,
      lastModified: object.LastModified?.toISOString() ?? null,
    }))

  return {
    objects,
    nextToken: response.IsTruncated ? (response.NextContinuationToken ?? null) : null,
  }
}

export async function putManagedObject(options: {
  key: string
  body: Uint8Array
  contentType: string
}): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: options.key,
      Body: options.body,
      ContentType: options.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )
}

export async function deleteManagedObject(key: string): Promise<void> {
  await getS3Client().send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }))
}
