import { createFileRoute } from "@tanstack/react-router"
import { auth } from "@twt/core/http/routes"
import { runtime } from "../../server/runtime"

const handler = ({ request }: { request: Request }) => runtime.runPromise(auth(request))

export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: handler, POST: handler } },
})
