import { describe, expect, it } from "vitest"
import { clientRateLimitKey } from "./RateLimiter"

const trusted = { trustProxyHeaders: true }
const untrusted = { trustProxyHeaders: false }

describe("clientRateLimitKey", () => {
  it("ignores spoofable forwarding headers unless proxy trust is explicit", () => {
    const left = new Headers({ "x-forwarded-for": "203.0.113.1" })
    const right = new Headers({ "x-forwarded-for": "203.0.113.2" })

    expect(clientRateLimitKey(left, "subscribe", untrusted)).toBe(
      clientRateLimitKey(right, "subscribe", untrusted),
    )
  })

  it("separates callers by proxy-reported address when trusted", () => {
    const left = new Headers({ "x-real-ip": "203.0.113.1" })
    const right = new Headers({ "x-real-ip": "203.0.113.2" })

    expect(clientRateLimitKey(left, "subscribe", trusted)).not.toBe(
      clientRateLimitKey(right, "subscribe", trusted),
    )
  })

  it("uses the last hop of X-Forwarded-For, which the proxy appended", () => {
    const spoofed = new Headers({ "x-forwarded-for": "198.51.100.9, 203.0.113.1" })
    const direct = new Headers({ "x-forwarded-for": "203.0.113.1" })

    expect(clientRateLimitKey(spoofed, "subscribe", trusted)).toBe(
      clientRateLimitKey(direct, "subscribe", trusted),
    )
  })

  it("does not let a client mint new buckets by rotating its User-Agent", () => {
    const left = new Headers({ "user-agent": "one", "x-real-ip": "203.0.113.1" })
    const right = new Headers({ "user-agent": "two", "x-real-ip": "203.0.113.1" })

    expect(clientRateLimitKey(left, "subscribe", trusted)).toBe(
      clientRateLimitKey(right, "subscribe", trusted),
    )
  })

  it("keeps separate buckets per action", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.1" })

    expect(clientRateLimitKey(headers, "subscribe", trusted)).not.toBe(
      clientRateLimitKey(headers, "unsubscribe", trusted),
    )
  })

  it("returns an opaque SHA-256 key that does not contain the address", () => {
    const key = clientRateLimitKey(
      new Headers({ "x-real-ip": "203.0.113.1" }),
      "subscribe",
      trusted,
    )

    expect(key).toMatch(/^[a-f0-9]{64}$/)
    expect(key).not.toContain("203.0.113.1")
  })
})
