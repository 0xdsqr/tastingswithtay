import { assert, it } from "@effect/vitest"
import { Auth, type Session } from "@twt/core/services/Auth"
import { Database } from "@twt/core/services/Database"
import { ConfigProvider, Effect, Layer } from "effect"
import { AdminAccess } from "./AdminAccess"

type UserRow = {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
}

const session = (id: string) => ({ user: { id } }) as unknown as Session

/** Builds the guard over a fixed session and user row; no database or auth library involved. */
const access = (options: {
  readonly session: Session | null
  readonly user: UserRow | undefined
}) =>
  AdminAccess.layerNoDeps.pipe(
    Layer.provide([
      Layer.succeed(
        Auth,
        Auth.of({
          handle: () => Effect.succeed(new Response()),
          getSession: () => Effect.succeed(options.session),
        }),
      ),
      Layer.succeed(
        Database,
        Database.of({
          // The guard runs exactly one query: the user lookup.
          query: () => Effect.succeed(options.user as never),
          drizzle: undefined as never,
        }),
      ),
      ConfigProvider.layer(ConfigProvider.fromEnv({ env: { BASE_URL: "https://admin.example" } })),
    ]),
  )

const tay: UserRow = {
  id: "u1",
  name: "Tay",
  email: "tay@example.com",
  role: "admin",
  banned: false,
}
const signedIn = { session: session("u1"), user: tay }

const authorize = (headers: HeadersInit) =>
  AdminAccess.use((guard) => guard.authorize(new Headers(headers)))
const authorizeMutation = (headers: HeadersInit) =>
  AdminAccess.use((guard) => guard.authorizeMutation(new Headers(headers)))

it.effect("admits a signed-in administrator", () =>
  Effect.gen(function* () {
    const admin = yield* authorize({})
    assert.deepStrictEqual(admin, {
      id: "u1",
      name: "Tay",
      email: "tay@example.com",
      role: "admin",
    })
  }).pipe(Effect.provide(access(signedIn))),
)

it.effect("rejects anonymous callers", () =>
  Effect.gen(function* () {
    assert.strictEqual((yield* Effect.flip(authorize({})))._tag, "Unauthorized")
  }).pipe(Effect.provide(access({ session: null, user: undefined }))),
)

it.effect("rejects signed-in users who are not administrators", () =>
  Effect.gen(function* () {
    assert.strictEqual((yield* Effect.flip(authorize({})))._tag, "Unauthorized")
  }).pipe(Effect.provide(access({ session: session("u1"), user: { ...tay, role: "user" } }))),
)

it.effect("rejects banned administrators even with a live session", () =>
  Effect.gen(function* () {
    assert.strictEqual((yield* Effect.flip(authorize({})))._tag, "Unauthorized")
  }).pipe(Effect.provide(access({ session: session("u1"), user: { ...tay, banned: true } }))),
)

it.effect("rejects a session whose user no longer exists", () =>
  Effect.gen(function* () {
    assert.strictEqual((yield* Effect.flip(authorize({})))._tag, "Unauthorized")
  }).pipe(Effect.provide(access({ session: session("u1"), user: undefined }))),
)

it.effect("allows mutations from the application's own origin", () =>
  Effect.gen(function* () {
    const admin = yield* authorizeMutation({
      origin: "https://admin.example",
      "sec-fetch-site": "same-origin",
    })
    assert.strictEqual(admin.id, "u1")
  }).pipe(Effect.provide(access(signedIn))),
)

it.effect("refuses mutations from another origin, even for an administrator", () =>
  Effect.gen(function* () {
    const fromOrigin = yield* Effect.flip(authorizeMutation({ origin: "https://evil.example" }))
    const fromFetchMetadata = yield* Effect.flip(
      authorizeMutation({ "sec-fetch-site": "cross-site" }),
    )

    assert.strictEqual(fromOrigin._tag, "Unauthorized")
    assert.strictEqual(fromFetchMetadata._tag, "Unauthorized")
  }).pipe(Effect.provide(access(signedIn))),
)
