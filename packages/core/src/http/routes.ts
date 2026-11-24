/**
 * Framework-agnostic handlers for the operational routes both applications
 * expose. Each returns a web `Response` and never fails.
 */
import { sql } from "@twt/database"
import { Effect, Option } from "effect"
import { Auth } from "../services/Auth"
import { Database } from "../services/Database"
import { type ManagedImageMetadata, Storage, managedImageKey } from "../services/Storage"
import { limitRequestBody } from "./request-body"

const noStore = { "Cache-Control": "no-store" }
const maxAuthBodyBytes = 64 * 1024

/** Liveness: the process is up. Deliberately touches no dependency. */
export const health = (request: Request): Response =>
  request.method === "HEAD"
    ? new Response(null, { status: 204 })
    : Response.json({ status: "ok" }, { headers: noStore })

/** Readiness: the database answers. */
export const ready: Effect.Effect<Response, never, Database> = Effect.gen(function* () {
  const database = yield* Database
  return yield* database
    .query("readiness", (db) => db.execute(sql`SELECT 1`))
    .pipe(
      Effect.as(Response.json({ status: "ready" }, { headers: noStore })),
      Effect.catch(() =>
        Effect.succeed(Response.json({ status: "unavailable" }, { status: 503, headers: noStore })),
      ),
    )
})

/** Serves `/api/auth/*`, refusing oversized bodies before they reach the auth library. */
export const auth: (request: Request) => Effect.Effect<Response, never, Auth> = Effect.fn(
  "http.auth",
)(function* (request) {
  const limited = yield* Effect.promise(() => limitRequestBody(request, maxAuthBodyBytes))
  if (limited instanceof Response) return limited
  return yield* Auth.use((service) => service.handle(limited))
})

const imageHeaders = (metadata: ManagedImageMetadata): Headers => {
  const headers = new Headers({
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": metadata.contentType,
    "X-Content-Type-Options": "nosniff",
  })
  if (metadata.etag) headers.set("ETag", metadata.etag)
  if (metadata.lastModified) headers.set("Last-Modified", metadata.lastModified.toUTCString())
  if (metadata.contentLength !== undefined) {
    headers.set("Content-Length", String(metadata.contentLength))
  }
  return headers
}

const notFound = () => new Response("Not found", { status: 404 })

/** Proxies a managed image from the bucket. A storage outage is a 503, never a cacheable 404. */
export const image: (
  request: Request,
  params: { readonly folder: string | undefined; readonly fileName: string | undefined },
) => Effect.Effect<Response, never, Storage> = Effect.fn("http.image")(
  function* (request, params) {
    const key = managedImageKey(params.folder, params.fileName)
    if (Option.isNone(key)) return notFound()
    const storage = yield* Storage

    if (request.method === "HEAD") {
      const metadata = yield* storage.getImageMetadata(key.value)
      return Option.match(metadata, {
        onNone: notFound,
        onSome: (found) => new Response(null, { headers: imageHeaders(found) }),
      })
    }

    const found = yield* storage.getImage(key.value)
    if (Option.isNone(found)) return notFound()

    const headers = imageHeaders(found.value)
    if (found.value.etag && request.headers.get("if-none-match") === found.value.etag) {
      yield* Effect.promise(() => found.value.body.cancel())
      return new Response(null, { status: 304, headers })
    }
    return new Response(found.value.body, { headers })
  },
  Effect.catchTag("StorageError", () =>
    Effect.succeed(
      new Response("Image storage is unavailable.", {
        status: 503,
        headers: { ...noStore, "Retry-After": "30" },
      }),
    ),
  ),
)
