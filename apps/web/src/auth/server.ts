import { initAuth } from "@twt/core/auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { getServerBaseUrl } from "../lib/runtime-url"

export const auth = initAuth({
  baseUrl: getServerBaseUrl(),
  secret: process.env.AUTH_SECRET,
  extraPlugins: [tanstackStartCookies()],
})
