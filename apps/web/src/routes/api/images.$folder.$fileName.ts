import { createFileRoute } from "@tanstack/react-router"
import { image } from "@twt/core/http/routes"
import { runtime } from "../../server/runtime"

const handler = ({
  request,
  params,
}: {
  request: Request
  params: { folder: string; fileName: string }
}) => runtime.runPromise(image(request, params))

export const Route = createFileRoute("/api/images/$folder/$fileName")({
  server: { handlers: { GET: handler, HEAD: handler } },
})
