import { afterEach, describe, expect, it, vi } from "vitest"
import { clientRateLimitKey } from "./rate-limit"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("clientRateLimitKey", () => {
  it("does not trust spoofable forwarding headers by default", () => {
    const left = new Headers({ "user-agent": "test", "x-forwarded-for": "203.0.113.1" })
    const right = new Headers({ "user-agent": "test", "x-forwarded-for": "203.0.113.2" })

    expect(clientRateLimitKey(left, "subscribe")).toBe(clientRateLimitKey(right, "subscribe"))
  })

  it("uses valid forwarding data only when proxy trust is explicit", () => {
    vi.stubEnv("TRUST_PROXY_HEADERS", "true")
    const left = new Headers({ "user-agent": "test", "x-real-ip": "203.0.113.1" })
    const right = new Headers({ "user-agent": "test", "x-real-ip": "203.0.113.2" })

    expect(clientRateLimitKey(left, "subscribe")).not.toBe(clientRateLimitKey(right, "subscribe"))
  })

  it("returns an opaque, fixed-length SHA-256 key", () => {
    const key = clientRateLimitKey(new Headers({ "user-agent": "secret-client" }), "subscribe")

    expect(key).toMatch(/^[a-f0-9]{64}$/)
    expect(key).not.toContain("secret-client")
  })
})
