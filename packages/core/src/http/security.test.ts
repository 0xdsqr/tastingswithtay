import { describe, expect, it } from "vitest"
import { createNonce, withSecurityHeaders } from "./security"

describe("withSecurityHeaders", () => {
  it("adds browser hardening headers while preserving the response", async () => {
    const response = withSecurityHeaders(new Response("ok", { status: 202 }), {
      nonce: "abc123",
      isProduction: false,
    })

    expect(response.status).toBe(202)
    expect(await response.text()).toBe("ok")
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'")
    expect(response.headers.get("x-content-type-options")).toBe("nosniff")
    expect(response.headers.get("x-frame-options")).toBe("DENY")
    expect(response.headers.get("strict-transport-security")).toBeNull()
  })

  it("allows only nonce-carrying scripts, never arbitrary inline ones", () => {
    const policy = withSecurityHeaders(new Response(), {
      nonce: "abc123",
      isProduction: false,
    }).headers.get("content-security-policy")!
    const scripts = policy.split("; ").find((directive) => directive.startsWith("script-src"))

    expect(scripts).toBe("script-src 'self' 'nonce-abc123'")
  })

  it("enables HSTS in production", () => {
    const response = withSecurityHeaders(new Response(), { nonce: "abc123", isProduction: true })

    expect(response.headers.get("strict-transport-security")).toContain("includeSubDomains")
  })
})

describe("createNonce", () => {
  it("returns a distinct base64 value on every call", () => {
    const nonces = new Set(Array.from({ length: 50 }, createNonce))

    expect(nonces.size).toBe(50)
    for (const nonce of nonces) expect(nonce).toMatch(/^[A-Za-z0-9+/]{24}$/)
  })
})
