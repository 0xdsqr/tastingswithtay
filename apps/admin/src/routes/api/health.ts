import { createFileRoute } from "@tanstack/react-router"
import { health } from "@twt/core/http/routes"

const handler = ({ request }: { request: Request }) => health(request)

export const Route = createFileRoute("/api/health")({
  server: { handlers: { GET: handler, HEAD: handler } },
})
