import { initAuth } from "@twt/core/auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"

const baseUrl = process.env.BASE_URL || "http://localhost:3000"

export const auth = initAuth({
  baseUrl,
  secret: process.env.AUTH_SECRET,
  extraPlugins: [tanstackStartCookies()],
})
