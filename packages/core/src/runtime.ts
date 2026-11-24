/**
 * Layer composition shared by both applications. Each app adds its own `Auth`
 * layer, builds one `ManagedRuntime` from the result, and runs every effect
 * through it.
 */
import * as OtelTracer from "@effect/opentelemetry/OtelTracer"
import { Layer } from "effect"
import { ProcessEnvConfig } from "./config"
import { Content } from "./services/Content"
import { Database } from "./services/Database"
import { RateLimiter } from "./services/RateLimiter"
import { Storage } from "./services/Storage"
import { Subscribers } from "./services/Subscribers"

/**
 * Effect spans are exported through the process-wide OpenTelemetry provider
 * registered by the runtime preload. Without one (tests, local development)
 * spans are no-ops.
 */
export const TracingLayer = OtelTracer.layerGlobal

/** Every service that does not depend on the hosting framework. */
export const CoreLayer = Layer.mergeAll(
  Content.layerNoDeps,
  Subscribers.layerNoDeps,
  RateLimiter.layerNoDeps,
  Storage.layer,
).pipe(
  Layer.provideMerge(Database.layer),
  Layer.provideMerge(TracingLayer),
  Layer.provideMerge(ProcessEnvConfig),
)
