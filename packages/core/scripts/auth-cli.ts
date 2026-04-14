import { initAuth } from "../src/auth/index"

// This is only used for CLI schema generation, not runtime
export const auth = initAuth({
  baseUrl: process.env.BASE_URL || "http://localhost:3010",
  secret: process.env.AUTH_SECRET || "cli-secret",
})
