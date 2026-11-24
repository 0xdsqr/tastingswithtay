import { assert, it } from "@effect/vitest"
import { ConfigProvider, Effect } from "effect"
import { DatabaseConfig, internalApiBaseUrl, publicBaseUrl, trustedOrigins } from "./config"

const withEnv =
  (env: Record<string, string>) =>
  <A, E>(effect: Effect.Effect<A, E>) =>
    Effect.provideService(effect, ConfigProvider.ConfigProvider, ConfigProvider.fromEnv({ env }))

it.effect("prefers BETTER_AUTH_URL, then BASE_URL, and strips the trailing slash", () =>
  Effect.gen(function* () {
    assert.strictEqual(
      yield* publicBaseUrl.pipe(
        withEnv({ BETTER_AUTH_URL: "https://admin.example/", BASE_URL: "https://example" }),
      ),
      "https://admin.example",
    )
    assert.strictEqual(
      yield* publicBaseUrl.pipe(withEnv({ BASE_URL: "https://example/" })),
      "https://example",
    )
    assert.strictEqual(
      yield* publicBaseUrl.pipe(withEnv({ PORT: "3011" })),
      "http://localhost:3011",
    )
  }),
)

it.effect("treats blank variables as unset", () =>
  Effect.gen(function* () {
    assert.strictEqual(
      yield* publicBaseUrl.pipe(withEnv({ BETTER_AUTH_URL: "   ", BASE_URL: "https://example" })),
      "https://example",
    )
  }),
)

it.effect("always trusts the public origin and de-duplicates the configured ones", () =>
  Effect.gen(function* () {
    assert.deepStrictEqual(
      yield* trustedOrigins.pipe(
        withEnv({
          BASE_URL: "https://example",
          TRUSTED_ORIGINS: " https://example , https://admin.example ,",
        }),
      ),
      ["https://example", "https://admin.example"],
    )
  }),
)

it.effect("reaches the API over INTERNAL_API_BASE_URL during server rendering", () =>
  Effect.gen(function* () {
    assert.strictEqual(
      yield* internalApiBaseUrl.pipe(
        withEnv({ INTERNAL_API_BASE_URL: "http://127.0.0.1:3010/", BASE_URL: "https://example" }),
      ),
      "http://127.0.0.1:3010",
    )
  }),
)

it.effect("rejects non-positive pool settings at startup", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(DatabaseConfig.pipe(withEnv({ DATABASE_POOL_MAX: "0" })))
    assert.include(String(error), "DATABASE_POOL_MAX")
  }),
)
