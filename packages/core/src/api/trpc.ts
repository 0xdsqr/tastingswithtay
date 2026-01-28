import { initTRPC, TRPCError } from "@trpc/server"
import { db } from "@twt/db/client"
import superjson from "superjson"
import { ZodError } from "zod"
import type { Auth } from "../auth"

export const createTRPCContext = async (opts: {
  headers: Headers
  auth: Auth
}) => {
  const authApi = opts.auth.api
  const session = await authApi.getSession({
    headers: opts.headers,
  })
  return {
    authApi,
    session,
    db,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router

const timingMiddleware = t.middleware(async ({ next, path, ctx }) => {
  const start = Date.now()

  const result = await next()

  const duration = Date.now() - start
  const userId = ctx.session?.user?.id

  if (result.ok) {
    console.log(
      `[TRPC] ${path} - ${duration}ms${userId ? ` (user: ${userId})` : ""}`,
    )
  } else {
    console.error(`[TRPC] ${path} - ERROR`, {
      duration,
      userId,
      code: result.error.code,
      message: result.error.message,
    })
  }

  return result
})

export const publicProcedure = t.procedure.use(timingMiddleware)

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })

export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }
    // Add admin check when we have roles
    // const user = ctx.session.user as typeof ctx.session.user & { role?: string }
    // if (user.role !== "admin") {
    //   throw new TRPCError({
    //     code: "FORBIDDEN",
    //     message: "Admin access required",
    //   })
    // }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })
