/**
 * The public site's single Effect runtime, plus the web handler for the HTTP
 * API. Both share one memo map, so services are built exactly once.
 */
import { ApiRoutes } from "@twt/core/api/handlers"
import { CoreLayer } from "@twt/core/runtime"
import { Auth } from "@twt/core/services/Auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { Layer, ManagedRuntime } from "effect"
import { HttpRouter, HttpServer } from "effect/http"

const memoMap = Layer.makeMemoMapUnsafe()

const AppLayer = Auth.layerNoDeps({ plugins: [tanstackStartCookies()] }).pipe(
  Layer.provideMerge(CoreLayer),
)

export const runtime = ManagedRuntime.make(AppLayer, { memoMap })

const api = HttpRouter.toWebHandler(
  ApiRoutes.pipe(Layer.provide(AppLayer), Layer.provide(HttpServer.layerServices)),
  { memoMap },
)

export const handleApiRequest = (request: Request): Promise<Response> => api.handler(request)

// Close the connection pool when the process is asked to stop.
const shutdown = () => void Promise.all([api.dispose(), runtime.dispose()])
process.once("SIGTERM", shutdown)
process.once("SIGINT", shutdown)
