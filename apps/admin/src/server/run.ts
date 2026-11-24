import type { DatabaseError, StorageError } from "@twt/core/domain/errors"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { Effect } from "effect"
import { AdminAccess, CurrentAdmin } from "./AdminAccess"
import type { AdminError, Unauthorized } from "./errors"
import { type AppServices, runtime } from "./runtime"

type Services = AppServices
type Failure = AdminError | Unauthorized | DatabaseError | StorageError

const unavailable = "The request could not be completed. Try again in a moment."

/**
 * Converts typed failures into the `Error` a server function rejects with.
 * Only `AdminError` messages reach the browser; infrastructure failures are
 * logged and replaced with a generic message.
 */
const toRejection = <A, R>(effect: Effect.Effect<A, Failure, R>) =>
  effect.pipe(
    Effect.catchTags({
      AdminError: (error) => Effect.fail(new Error(error.message)),
      Unauthorized: () => Effect.fail(new Error("UNAUTHORIZED")),
      DatabaseError: (error) =>
        Effect.andThen(
          Effect.logError("Admin request failed", error),
          Effect.fail(new Error(unavailable)),
        ),
      StorageError: (error) =>
        Effect.andThen(
          Effect.logError("Admin request failed", error),
          Effect.fail(new Error(unavailable)),
        ),
    }),
  )

const run = <A>(effect: Effect.Effect<A, Error, Services>): Promise<A> => runtime.runPromise(effect)

/** Runs a read-only effect for the signed-in administrator. */
export const runAdminQuery = <A>(
  effect: Effect.Effect<A, Failure, Services | CurrentAdmin>,
): Promise<A> =>
  run(
    toRejection(
      Effect.gen(function* () {
        const access = yield* AdminAccess
        const admin = yield* access.authorize(getRequestHeaders())
        return yield* Effect.provideService(effect, CurrentAdmin, admin)
      }),
    ),
  )

/** Runs a state-changing effect for the signed-in administrator, rejecting cross-site requests. */
export const runAdminMutation = <A>(
  effect: Effect.Effect<A, Failure, Services | CurrentAdmin>,
  headers: Headers = getRequestHeaders(),
): Promise<A> =>
  run(
    toRejection(
      Effect.gen(function* () {
        const access = yield* AdminAccess
        const admin = yield* access.authorizeMutation(headers)
        return yield* Effect.provideService(effect, CurrentAdmin, admin)
      }),
    ),
  )
