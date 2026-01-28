import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import type { AppRouter } from "@twt/core/api"
import superjson from "superjson"

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser should use relative path
    return ""
  }
  // SSR should use localhost
  return process.env.BASE_URL ?? "http://localhost:3000"
}

// Vanilla client for server-side usage
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
})

// React Query integration
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()

// Re-export types for convenience
export type { AppRouter }
