import { initTRPC, TRPCError } from "@trpc/server"
import { db } from "@twt/db/client"
import superjson from "superjson"
import { ZodError } from "zod"
import type { Auth } from "../auth"

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

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  const result = await next()

  const duration = Date.now() - start
  if (result.ok && duration >= 1_000) {
    console.warn("[trpc] Slow procedure", { path, durationMs: duration })
  }

  return result
})

export const publicProcedure = t.procedure.use(timingMiddleware)

export const protectedProcedure = t.procedure.use(timingMiddleware).use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})
