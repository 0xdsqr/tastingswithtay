import { assert, it } from "@effect/vitest"
import { sql } from "@twt/database"
import { ConfigProvider, Effect, Layer } from "effect"
import { Database } from "./Database"

// Nothing listens on port 1, so every query fails at connect time.
const unreachable = Database.layer.pipe(
  Layer.provide(
    ConfigProvider.layer(
      ConfigProvider.fromEnv({
        env: {
          DATABASE_URL: "postgres://app:hunter2-secret@127.0.0.1:1/app",
          DATABASE_CONNECTION_TIMEOUT_MS: "500",
        },
      }),
    ),
  ),
)

it.effect("reports failures without leaking the connection string", () =>
  Effect.gen(function* () {
    const database = yield* Database

    const error = yield* Effect.flip(database.query("probe", (db) => db.execute(sql`SELECT 1`)))

    assert.strictEqual(error._tag, "DatabaseError")
    assert.strictEqual(error.operation, "probe")
    assert.notInclude(JSON.stringify(error), "hunter2-secret")
    assert.notInclude(String(error), "hunter2-secret")
  }).pipe(Effect.provide(unreachable)),
)

it.effect("refuses to start in production without a database URL", () =>
  Effect.gen(function* () {
    const exit = yield* Effect.exit(
      Layer.build(
        Database.layer.pipe(
          Layer.provide(
            ConfigProvider.layer(ConfigProvider.fromEnv({ env: { NODE_ENV: "production" } })),
          ),
        ),
      ),
    )
    assert.isTrue(exit._tag === "Failure")
  }).pipe(Effect.scoped),
)
