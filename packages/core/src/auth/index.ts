import { db } from "@twt/db/client"
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, jwt } from "better-auth/plugins"

export function initAuth(options: {
  baseUrl: BetterAuthOptions["baseURL"]
  secret: string | undefined
  extraPlugins?: BetterAuthPlugin[]
  trustedOrigins?: string[]
}): ReturnType<typeof betterAuth> {
  const secret = options.secret?.trim()
  if (!secret) {
    throw new Error("AUTH_SECRET must be set before starting the app.")
  }

  const discordClientId = process.env.DISCORD_CLIENT_ID?.trim()
  const discordClientSecret = process.env.DISCORD_CLIENT_SECRET?.trim()

  const config: BetterAuthOptions = {
    database: drizzleAdapter(db, { provider: "pg" }),
    baseURL: options.baseUrl,
    secret,

    trustedOrigins: options.trustedOrigins ?? [],

    plugins: [
      jwt(),
      admin({ defaultRole: "user", adminRoles: ["admin"] }),
      ...(options.extraPlugins ?? []),
    ],

    socialProviders:
      discordClientId && discordClientSecret
        ? {
            discord: {
              clientId: discordClientId,
              clientSecret: discordClientSecret,
            },
          }
        : undefined,
    emailAndPassword: {
      enabled: true,
    },
  }

  return betterAuth(config)
}

type InternalAuth = ReturnType<typeof betterAuth>
export type Auth = InternalAuth
export type Session = InternalAuth["$Infer"]["Session"]
