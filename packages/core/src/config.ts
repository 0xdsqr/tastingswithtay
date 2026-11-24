/**
 * Every environment variable the applications read, parsed and validated in
 * one place. Services yield these instead of touching `process.env`.
 */
import { Config, ConfigProvider, Effect, Option, Schema } from "effect"

/**
 * Reads configuration from the process environment and nothing else.
 *
 * Effect's default provider also merges `import.meta.env`, and Vite defines
 * `import.meta.env.BASE_URL` as the asset base path (`"/"`), which would
 * silently shadow the real `BASE_URL`. Every runtime must provide this layer.
 */
export const ProcessEnvConfig = ConfigProvider.layer(
  Effect.sync(() => ConfigProvider.fromEnv({ env: { ...process.env } as Record<string, string> })),
)

const PositiveInt = Schema.Int.check(Schema.isGreaterThan(0))

const positiveInt = (name: string, fallback: number) =>
  Config.schema(PositiveInt, name).pipe(Config.withDefault(fallback))

/** A string variable where unset, empty, and whitespace-only all mean "absent". */
const optionalString = (name: string) =>
  Config.option(Config.String(name)).pipe(
    Config.map(Option.flatMap((value) => Option.liftPredicate(value.trim(), (v) => v !== ""))),
  )

const stringWithDefault = (name: string, fallback: string) =>
  optionalString(name).pipe(Config.map(Option.getOrElse(() => fallback)))

const trimTrailingSlash = (url: string) => (url.endsWith("/") ? url.slice(0, -1) : url)

export const isProduction = stringWithDefault("NODE_ENV", "development").pipe(
  Config.map((environment) => environment === "production"),
)

export const trustProxyHeaders = Config.Boolean("TRUST_PROXY_HEADERS").pipe(
  Config.withDefault(false),
)

export const DatabaseConfig = Config.all({
  url: Config.option(Config.Redacted("DATABASE_URL")),
  applicationName: stringWithDefault("DATABASE_APPLICATION_NAME", "tastingswithtay"),
  poolMax: positiveInt("DATABASE_POOL_MAX", 10),
  idleTimeoutMillis: positiveInt("DATABASE_IDLE_TIMEOUT_MS", 30_000),
  connectionTimeoutMillis: positiveInt("DATABASE_CONNECTION_TIMEOUT_MS", 5_000),
  queryTimeoutMillis: positiveInt("DATABASE_QUERY_TIMEOUT_MS", 15_000),
  statementTimeoutMillis: positiveInt("DATABASE_STATEMENT_TIMEOUT_MS", 15_000),
  ssl: stringWithDefault("DATABASE_SSL", "disable").pipe(Config.map((mode) => mode === "require")),
  sslRejectUnauthorized: Config.Boolean("DATABASE_SSL_REJECT_UNAUTHORIZED").pipe(
    Config.withDefault(true),
  ),
  isProduction,
})

export const StorageConfig = Config.all({
  endpoint: optionalString("S3_ENDPOINT"),
  useSsl: Config.Boolean("S3_USE_SSL").pipe(Config.withDefault(false)),
  bucket: stringWithDefault("S3_BUCKET", "tastingswithtay"),
  region: stringWithDefault("S3_REGION", "us-east-1"),
  forcePathStyle: Config.Boolean("S3_FORCE_PATH_STYLE").pipe(Config.withDefault(true)),
  accessKeyId: Config.option(Config.Redacted("S3_ACCESS_KEY")),
  secretAccessKey: Config.option(Config.Redacted("S3_SECRET_KEY")),
})

const listenPort = stringWithDefault("PORT", "3010")

/** Externally visible origin of this application, without a trailing slash. */
export const publicBaseUrl = Config.all({
  betterAuthUrl: optionalString("BETTER_AUTH_URL"),
  baseUrl: optionalString("BASE_URL"),
  port: listenPort,
}).pipe(
  Config.map(({ betterAuthUrl, baseUrl, port }) =>
    trimTrailingSlash(
      Option.getOrElse(
        Option.orElse(betterAuthUrl, () => baseUrl),
        () => `http://localhost:${port}`,
      ),
    ),
  ),
)

/** Origins allowed to make credentialed or state-changing requests. */
export const trustedOrigins = Config.all({
  own: publicBaseUrl,
  configured: stringWithDefault("TRUSTED_ORIGINS", ""),
}).pipe(
  Config.map(({ own, configured }) => {
    const origins = configured
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin !== "")
    return Array.from(new Set([own, ...origins]))
  }),
)

export const AuthConfig = Config.all({
  secret: Config.option(Config.Redacted("AUTH_SECRET")),
  baseUrl: publicBaseUrl,
  trustedOrigins,
  trustProxyHeaders,
  isProduction,
})

/** Origin server-side rendering uses to reach this app's own API. */
export const internalApiBaseUrl = Config.all({
  internal: optionalString("INTERNAL_API_BASE_URL"),
  baseUrl: optionalString("BASE_URL"),
  port: listenPort,
}).pipe(
  Config.map(({ internal, baseUrl, port }) =>
    trimTrailingSlash(
      Option.getOrElse(
        Option.orElse(internal, () => baseUrl),
        () => `http://localhost:${port}`,
      ),
    ),
  ),
)
