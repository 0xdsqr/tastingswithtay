import { createFileRoute } from "@tanstack/react-router"
import { ready } from "@twt/core/http/routes"
import { runtime } from "../../server/runtime"

const handler = () => runtime.runPromise(ready)

export const Route = createFileRoute("/api/ready")({
  server: { handlers: { GET: handler, HEAD: handler } },
})
