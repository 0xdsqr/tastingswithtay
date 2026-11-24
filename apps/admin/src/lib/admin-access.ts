import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { Effect } from "effect"
import { AdminAccess, type AdminUser } from "../server/AdminAccess"
import { runtime } from "../server/runtime"

export type { AdminUser }

/** The signed-in administrator, or null. Route guards use this to decide where to send a visitor. */
export const getAdminSessionUser = createServerFn({ method: "GET" }).handler(
  (): Promise<AdminUser | null> =>
    runtime.runPromise(
      AdminAccess.use((access) => access.authorize(getRequestHeaders())).pipe(
        Effect.catchTag("Unauthorized", () => Effect.succeed(null)),
        Effect.orDie,
      ),
    ),
)
