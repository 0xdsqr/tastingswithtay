import { betterAuth, type BetterAuthOptions, type BetterAuthPlugin } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { Context, Effect, Layer, Option, Redacted } from "effect"
import { AuthConfig } from "../config"
import { Database } from "./Database"

type AuthInstance = ReturnType<typeof betterAuth>
export type Session = AuthInstance["$Infer"]["Session"]

export class Auth extends Context.Service<
  Auth,
  {
    /** Serves a request under `/api/auth`. */
    handle(request: Request): Effect.Effect<Response>
    /** The signed-in session for these request headers, if any. */
    getSession(headers: Headers): Effect.Effect<Session | null>
  }
>()("@twt/core/services/Auth") {
  /**
   * Email-and-password authentication with sign-up closed: accounts are
   * provisioned by an administrator. `plugins` carries framework glue such as
   * cookie handling.
   */
  static readonly layerNoDeps = (options: { readonly plugins: ReadonlyArray<BetterAuthPlugin> }) =>
    Layer.effect(
      Auth,
      Effect.gen(function* () {
        const config = yield* AuthConfig
        const database = yield* Database

        const secret = Option.getOrElse(Option.map(config.secret, Redacted.value), () => "").trim()
        if (secret === "") {
          return yield* Effect.die(new Error("AUTH_SECRET must be set before starting the app."))
        }
        if (Buffer.byteLength(secret, "utf8") < 32) {
          return yield* Effect.die(
            new Error("AUTH_SECRET must be at least 32 bytes long and randomly generated."),
          )
        }
        if (config.isProduction && !config.baseUrl.startsWith("https://")) {
          return yield* Effect.die(
            new Error("The production authentication base URL must use HTTPS."),
          )
        }

        const authOptions: BetterAuthOptions = {
          database: drizzleAdapter(database.drizzle, { provider: "pg" }),
          baseURL: config.baseUrl,
          secret,
          trustedOrigins: [...config.trustedOrigins],
          plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] }), ...options.plugins],
          emailAndPassword: {
            enabled: true,
            disableSignUp: true,
            minPasswordLength: 12,
            maxPasswordLength: 128,
          },
          rateLimit: {
            enabled: true,
            storage: "database",
            window: 60,
            max: 100,
            customRules: {
              "/sign-in/email": { window: 60, max: 10 },
              "/sign-up/email": { window: 300, max: 5 },
              "/request-password-reset": { window: 300, max: 5 },
            },
          },
          advanced: {
            useSecureCookies: config.isProduction,
            ipAddress: {
              ipAddressHeaders: config.trustProxyHeaders ? ["x-real-ip", "x-forwarded-for"] : [],
            },
          },
        }
        const instance = betterAuth(authOptions)

        const handle = (request: Request) =>
          Effect.promise(() => instance.handler(request)).pipe(Effect.withSpan("Auth.handle"))

        const getSession = (headers: Headers) =>
          Effect.promise(() => instance.api.getSession({ headers })).pipe(
            Effect.withSpan("Auth.getSession"),
          )

        return Auth.of({ handle, getSession })
      }),
    )
}
