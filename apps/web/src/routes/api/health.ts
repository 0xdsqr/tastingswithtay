import { createFileRoute } from "@tanstack/react-router"

const healthy = () => Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } })

export const Route = createFileRoute("/api/health")({
  server: { handlers: { GET: healthy, HEAD: () => new Response(null, { status: 204 }) } },
})
