import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { getGlobalStartContext } from "@tanstack/react-start"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = new QueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Server-side: the per-request CSP nonce set in server.ts. In the browser the
    // router reads it back from the `csp-nonce` meta tag.
    ssr: { nonce: getGlobalStartContext()?.nonce },
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
    server: { requestContext: { nonce: string } }
  }
}
