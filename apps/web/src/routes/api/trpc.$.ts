import { createFileRoute } from "@tanstack/react-router"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter, createTRPCContext } from "@twt/core/api"
import { rebuildRequestWithBody } from "@twt/core/http/request-body"

import { auth } from "../../auth/server"
import { getTrustedOrigins } from "@twt/core/http/runtime-url"

const maxBodyBytes = 1_048_576
const maxGetUrlLength = 16_384

function reject(status: number, message: string): Response {
  return Response.json({ error: message }, { status })
}

async function readLimitedBody(request: Request): Promise<Uint8Array | Response> {
  if (!request.body) return new Uint8Array()

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > maxBodyBytes) {
      await reader.cancel()
      return reject(413, "Request body is too large.")
    }
    chunks.push(value)
  }

  const body = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

const handler = async (request: Request): Promise<Response> => {
  const allowedOrigins = new Set(getTrustedOrigins())
  const origin = request.headers.get("origin")
  const fetchSite = request.headers.get("sec-fetch-site")

  if ((origin && !allowedOrigins.has(origin)) || fetchSite === "cross-site") {
    return reject(403, "Cross-origin request rejected.")
  }

  if (request.method === "GET" && request.url.length > maxGetUrlLength) {
    return reject(414, "Request URL is too long.")
  }

  let req = request
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type")?.toLowerCase() ?? ""
    if (!contentType.startsWith("application/json")) {
      return reject(415, "Content-Type must be application/json.")
    }
    const declaredLength = Number(request.headers.get("content-length"))
    if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
      return reject(413, "Request body is too large.")
    }
    const body = await readLimitedBody(request)
    if (body instanceof Response) return body
    req = rebuildRequestWithBody(request, body)
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () =>
      createTRPCContext({
        auth: auth,
        headers: request.headers,
      }),
    onError({ error, path }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("[trpc] Internal request failure", { path, code: error.code })
      }
    },
  })
}

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
})
