import { createFileRoute } from "@tanstack/react-router"
import { checkDatabaseReadiness } from "@twt/core/http/readiness"

async function ready(): Promise<Response> {
  try {
    await checkDatabaseReadiness()
    return Response.json({ status: "ready" }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}

export const Route = createFileRoute("/api/ready")({
  server: { handlers: { GET: ready, HEAD: ready } },
})
