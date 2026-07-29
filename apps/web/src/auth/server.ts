import { initAuth } from "@twt/core/auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { getPublicBaseUrl, getTrustedOrigins } from "@twt/core/http/runtime-url"

export const auth = initAuth({
  baseUrl: getPublicBaseUrl(),
  secret: process.env.AUTH_SECRET,
  extraPlugins: [tanstackStartCookies()],
  trustedOrigins: getTrustedOrigins(),
  allowSignUp: false,
  allowSocialProviders: false,
})
