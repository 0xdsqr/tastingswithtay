import { createFileRoute } from "@tanstack/react-router"
import { trustedOrigins } from "@twt/core/config"
import { limitRequestBody } from "@twt/core/http/request-body"
import { Effect } from "effect"
import { handleApiRequest, runtime } from "../../server/runtime"

const maxBodyBytes = 1_048_576
const maxGetUrlLength = 16_384

const reject = (status: number, error: string) => Response.json({ error }, { status })

/**
 * Edge checks applied before a request reaches the API: same-site callers
 * only, bounded URLs and bodies, and JSON-only writes.
 */
const guard = Effect.fn("http.apiGuard")(function* (request: Request) {
  const allowedOrigins = new Set(yield* Effect.orDie(trustedOrigins))
  const origin = request.headers.get("origin")
  if (
    (origin !== null && !allowedOrigins.has(origin)) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return reject(403, "Cross-origin request rejected.")
  }

  if (request.method === "GET") {
    return request.url.length > maxGetUrlLength ? reject(414, "Request URL is too long.") : request
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? ""
  if (!contentType.startsWith("application/json")) {
    return reject(415, "Content-Type must be application/json.")
  }
  return yield* Effect.promise(() => limitRequestBody(request, maxBodyBytes))
})

const handler = async ({ request }: { request: Request }): Promise<Response> => {
  const guarded = await runtime.runPromise(guard(request))
  return guarded instanceof Response ? guarded : handleApiRequest(guarded)
}

export const Route = createFileRoute("/api/v1/$")({
  server: { handlers: { GET: handler, POST: handler } },
})
