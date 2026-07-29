import { db } from "@twt/database/client"
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"

export function initAuth(options: {
  baseUrl: BetterAuthOptions["baseURL"]
  secret: string | undefined
  extraPlugins?: BetterAuthPlugin[]
  trustedOrigins?: string[]
  allowSignUp?: boolean
  allowSocialProviders?: boolean
}): ReturnType<typeof betterAuth> {
  const secret = options.secret?.trim()
  if (!secret) {
    throw new Error("AUTH_SECRET must be set before starting the app.")
  }
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("AUTH_SECRET must be at least 32 bytes long and randomly generated.")
  }
  if (
    process.env.NODE_ENV === "production" &&
    (typeof options.baseUrl !== "string" || !options.baseUrl.startsWith("https://"))
  ) {
    throw new Error("The production authentication base URL must use HTTPS.")
  }

  const discordClientId = process.env.DISCORD_CLIENT_ID?.trim()
  const discordClientSecret = process.env.DISCORD_CLIENT_SECRET?.trim()

  const config: BetterAuthOptions = {
    database: drizzleAdapter(db, { provider: "pg" }),
    baseURL: options.baseUrl,
    secret,

    trustedOrigins: options.trustedOrigins ?? [],

    plugins: [
      admin({ defaultRole: "user", adminRoles: ["admin"] }),
      ...(options.extraPlugins ?? []),
    ],

    socialProviders:
      options.allowSocialProviders !== false && discordClientId && discordClientSecret
        ? {
            discord: {
              clientId: discordClientId,
              clientSecret: discordClientSecret,
            },
          }
        : undefined,
    emailAndPassword: {
      enabled: true,
      disableSignUp: options.allowSignUp === false,
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
      useSecureCookies: process.env.NODE_ENV === "production",
      ipAddress: {
        ipAddressHeaders:
          process.env.TRUST_PROXY_HEADERS === "true" ? ["x-real-ip", "x-forwarded-for"] : [],
      },
    },
  }

  return betterAuth(config)
}

type InternalAuth = ReturnType<typeof betterAuth>
export type Auth = InternalAuth
export type Session = InternalAuth["$Infer"]["Session"]
