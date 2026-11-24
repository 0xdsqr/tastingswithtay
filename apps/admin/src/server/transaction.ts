import { DatabaseError } from "@twt/core/domain/errors"
import { Database } from "@twt/core/services/Database"
import type { DrizzleDatabase } from "@twt/database/client"
import { Effect } from "effect"
import { AdminError } from "./errors"

export type Transaction = Parameters<Parameters<DrizzleDatabase["transaction"]>[0]>[0]

/**
 * Runs `run` in a database transaction. Throwing an `AdminError` inside rolls
 * back and surfaces that error; anything else becomes a `DatabaseError`.
 */
export const transaction = <A>(operation: string, run: (tx: Transaction) => Promise<A>) =>
  Effect.flatMap(Database, (database) =>
    Effect.tryPromise({
      try: () => database.drizzle.transaction(run),
      catch: (cause) =>
        cause instanceof AdminError
          ? cause
          : new DatabaseError({
              operation,
              reason: cause instanceof Error && cause.name !== "" ? cause.name : "UnknownError",
            }),
    }),
  ).pipe(Effect.withSpan(`admin.${operation}`))
