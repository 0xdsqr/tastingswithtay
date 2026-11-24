import { createDatabase, type DrizzleDatabase } from "@twt/database/client"
import { Context, Effect, Layer, Option, Redacted } from "effect"
import { DatabaseConfig } from "../config"
import { DatabaseError } from "../domain/errors"

const errorName = (cause: unknown): string =>
  cause instanceof Error && cause.name !== "" ? cause.name : "UnknownError"

export class Database extends Context.Service<
  Database,
  {
    /**
     * Runs a Drizzle query. Failures become a `DatabaseError` carrying only the
     * driver error's name, so connection strings can never leak through it.
     */
    query<A>(
      operation: string,
      run: (db: DrizzleDatabase) => Promise<A>,
    ): Effect.Effect<A, DatabaseError>
    /** The raw Drizzle handle, for libraries that need to own their queries. */
    readonly drizzle: DrizzleDatabase
  }
>()("@twt/core/services/Database") {
  static readonly layer = Layer.effect(
    Database,
    Effect.gen(function* () {
      const config = yield* DatabaseConfig

      if (config.isProduction && Option.isNone(config.url)) {
        return yield* Effect.die(
          new Error("DATABASE_URL must be set before starting in production."),
        )
      }

      const services = yield* Effect.context<never>()
      const { db } = yield* Effect.acquireRelease(
        Effect.sync(() =>
          createDatabase({
            connectionString: Option.getOrUndefined(Option.map(config.url, Redacted.value)),
            applicationName: config.applicationName,
            poolMax: config.poolMax,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis,
            queryTimeoutMillis: config.queryTimeoutMillis,
            statementTimeoutMillis: config.statementTimeoutMillis,
            allowExitOnIdle: !config.isProduction,
            ssl: config.ssl ? { rejectUnauthorized: config.sslRejectUnauthorized } : undefined,
            onIdleClientError: (error) =>
              Effect.runFork(
                Effect.logError("Unexpected idle database client error").pipe(
                  Effect.annotateLogs({ errorName: errorName(error) }),
                  Effect.provideContext(services),
                ),
              ),
          }),
        ),
        ({ pool }) => Effect.promise(() => pool.end()),
      )

      const query = <A>(operation: string, run: (db: DrizzleDatabase) => Promise<A>) =>
        Effect.tryPromise({
          try: () => run(db),
          catch: (cause) => new DatabaseError({ operation, reason: errorName(cause) }),
        }).pipe(Effect.withSpan(`Database.${operation}`))

      return Database.of({ query, drizzle: db })
    }),
  )
}
