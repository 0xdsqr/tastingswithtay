/**
 * The admin application's single Effect runtime. Every server function and API
 * route runs its effects through `runtime`, so services are built once.
 */
import { CoreLayer } from "@twt/core/runtime"
import { Auth } from "@twt/core/services/Auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { Layer, ManagedRuntime } from "effect"
import { AdminAccess } from "./AdminAccess"
import { AdminAssets } from "./AdminAssets"
import { AdminContent } from "./AdminContent"
import { AdminSite } from "./AdminSite"

const AppLayer = Layer.mergeAll(
  AdminAccess.layerNoDeps,
  AdminAssets.layerNoDeps,
  AdminContent.layerNoDeps,
  AdminSite.layerNoDeps,
).pipe(
  Layer.provideMerge(Auth.layerNoDeps({ plugins: [tanstackStartCookies()] })),
  Layer.provideMerge(CoreLayer),
)

export type AppServices = Layer.Success<typeof AppLayer>

export const runtime = ManagedRuntime.make(AppLayer)

// Close the connection pool when the process is asked to stop.
process.once("SIGTERM", () => void runtime.dispose())
process.once("SIGINT", () => void runtime.dispose())
