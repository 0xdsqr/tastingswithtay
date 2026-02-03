import { initAuth } from "@twt/core/auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"

const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT ?? 3002}`

export const auth = initAuth({
  baseUrl,
  secret: process.env.AUTH_SECRET,
  extraPlugins: [tanstackStartCookies()],
})
