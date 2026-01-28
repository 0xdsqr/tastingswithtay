import { createFileRoute } from "@tanstack/react-router"
import { auth } from "../../auth/server"

const handler = (req: Request) => auth.handler(req)

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
})
