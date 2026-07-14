import { afterEach, describe, expect, it, vi } from "vitest"
import { withSecurityHeaders } from "./security"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("withSecurityHeaders", () => {
  it("adds browser hardening headers while preserving the response", async () => {
    const response = withSecurityHeaders(new Response("ok", { status: 202 }))

    expect(response.status).toBe(202)
    expect(await response.text()).toBe("ok")
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'")
    expect(response.headers.get("x-content-type-options")).toBe("nosniff")
    expect(response.headers.get("x-frame-options")).toBe("DENY")
    expect(response.headers.get("strict-transport-security")).toBeNull()
  })

  it("enables HSTS in production", () => {
    vi.stubEnv("NODE_ENV", "production")
    const response = withSecurityHeaders(new Response())

    expect(response.headers.get("strict-transport-security")).toContain("includeSubDomains")
  })
})
