import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3"

const managedImageFolders = new Set([
  "about",
  "recipes",
  "wines",
  "experiments",
  "gallery",
  "brand",
  "system",
  "uploads",
])

type ManagedImageResponse = {
  body: ReadableStream
  contentType: string
  contentLength?: number
  etag?: string
  lastModified?: Date
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
    throw new Error("Set S3_ACCESS_KEY and S3_SECRET_KEY before serving managed images.")
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

function keyForManagedImage(
  folder: string | undefined,
  fileName: string | undefined,
): string | null {
  if (!folder || !fileName || !managedImageFolders.has(folder)) return null
  if (fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) return null

  return `${folder}/${fileName}`
}

export async function getManagedImage(
  folder: string | undefined,
  fileName: string | undefined,
): Promise<ManagedImageResponse | null> {
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
    console.error("[managed-images] RustFS image fetch failed", {
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
): Promise<Omit<ManagedImageResponse, "body"> | null> {
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
