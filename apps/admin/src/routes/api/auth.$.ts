import { createFileRoute } from "@tanstack/react-router"
import { limitRequestBody } from "@twt/core/http/request-body"
import { auth } from "../../auth/server"

const maxAuthBodyBytes = 64 * 1024

const handler = async (request: Request): Promise<Response> => {
  const limited = await limitRequestBody(request, maxAuthBodyBytes)
  return limited instanceof Response ? limited : auth.handler(limited)
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
})
