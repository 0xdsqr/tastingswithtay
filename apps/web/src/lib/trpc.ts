import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import type { AppRouter } from "@twt/core/api"
import superjson from "superjson"
import { getTrpcBaseUrl } from "./runtime-url"

// Vanilla client for server-side usage (in loaders)
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getTrpcBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
})

// React Query integration for client-side mutations/queries
export const { TRPCProvider, useTRPCClient } = createTRPCContext<AppRouter>()

// Re-export types for convenience
export type { AppRouter }
