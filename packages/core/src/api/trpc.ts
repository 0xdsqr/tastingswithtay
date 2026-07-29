import { initTRPC } from "@trpc/server"
import { db } from "@twt/database/client"
import superjson from "superjson"
import { ZodError } from "zod"
import type { Auth } from "../auth"
import { recordSpanError, setSpanAttributes, withSpan } from "../telemetry/tracing"

export const createTRPCContext = async (opts: { headers: Headers; auth: Auth }) => {
  const authApi = opts.auth.api
  const session = await authApi.getSession({
    headers: opts.headers,
  })
  return {
    authApi,
    session,
    headers: opts.headers,
    db,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    const internal = error.code === "INTERNAL_SERVER_ERROR"
    return {
      ...shape,
      message: internal ? "An unexpected server error occurred." : shape.message,
      data: {
        ...shape.data,
        stack: process.env.NODE_ENV === "production" ? undefined : shape.data.stack,
        zodError: !internal && error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

const tracingMiddleware = t.middleware(async ({ next, path, type }) => {
  return withSpan(`trpc.${path}`, { "trpc.path": path, "trpc.type": type }, async () => {
    const start = Date.now()
    const result = await next()

    setSpanAttributes({ "trpc.duration_ms": Date.now() - start, "trpc.ok": result.ok })
    if (!result.ok) {
      recordSpanError(result.error)
    }

    return result
  })
})

export const publicProcedure = t.procedure.use(tracingMiddleware)
