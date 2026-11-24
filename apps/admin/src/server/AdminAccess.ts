import { trustedOrigins } from "@twt/core/config"
import type { DatabaseError } from "@twt/core/domain/errors"
import { Auth } from "@twt/core/services/Auth"
import { Database } from "@twt/core/services/Database"
import { Context, Effect, Layer } from "effect"
import { Unauthorized } from "./errors"

export type AdminUser = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly role: string
}

/** The administrator a request was authorized as. */
export class CurrentAdmin extends Context.Service<CurrentAdmin, AdminUser>()(
  "admin/server/CurrentAdmin",
) {}

export class AdminAccess extends Context.Service<
  AdminAccess,
  {
    /**
     * Resolves the administrator behind a request. Role and ban status are read
     * from the database on every call, so revoking access takes effect at once.
     */
    authorize(headers: Headers): Effect.Effect<AdminUser, Unauthorized | DatabaseError>
    /**
     * As `authorize`, and additionally rejects cross-site requests. Use for
     * anything that changes state.
     */
    authorizeMutation(headers: Headers): Effect.Effect<AdminUser, Unauthorized | DatabaseError>
  }
>()("admin/server/AdminAccess") {
  static readonly layerNoDeps = Layer.effect(
    AdminAccess,
    Effect.gen(function* () {
      const auth = yield* Auth
      const database = yield* Database
      const allowedOrigins = new Set(yield* trustedOrigins)

      const authorize = Effect.fn("AdminAccess.authorize")(function* (headers: Headers) {
        const session = yield* auth.getSession(headers)
        if (!session?.user.id) return yield* new Unauthorized()

        const user = yield* database.query("admin.findUser", (db) =>
          db.query.user.findFirst({
            where: (fields, operators) => operators.eq(fields.id, session.user.id),
          }),
        )
        if (!user || user.role?.toLowerCase() !== "admin" || user.banned) {
          return yield* new Unauthorized()
        }

        return { id: user.id, name: user.name, email: user.email, role: "admin" }
      })

      const authorizeMutation = Effect.fn("AdminAccess.authorizeMutation")(function* (
        headers: Headers,
      ) {
        const origin = headers.get("origin")
        if (
          (origin !== null && !allowedOrigins.has(origin)) ||
          headers.get("sec-fetch-site") === "cross-site"
        ) {
          return yield* new Unauthorized()
        }
        return yield* authorize(headers)
      })

      return AdminAccess.of({ authorize, authorizeMutation })
    }),
  )
}
