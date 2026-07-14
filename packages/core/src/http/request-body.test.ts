import { describe, expect, it } from "vitest"
import { limitRequestBody } from "./request-body"

describe("limitRequestBody", () => {
  it("preserves an in-budget request body", async () => {
    const request = new Request("https://example.invalid", { method: "POST", body: "hello" })
    const result = await limitRequestBody(request, 10)

    expect(result).toBeInstanceOf(Request)
    expect(await (result as Request).text()).toBe("hello")
  })

  it("rebuilds request-like objects without relying on private runtime state", async () => {
    const nativeRequest = new Request("https://example.invalid/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json", "x-request-id": "request-1" },
      body: '{"email":"test@example.com"}',
    })
    const runtimeRequest = {
      url: nativeRequest.url,
      method: nativeRequest.method,
      headers: nativeRequest.headers,
      body: nativeRequest.body,
    } as Request

    const result = await limitRequestBody(runtimeRequest, 1_024)

    expect(result).toBeInstanceOf(Request)
    expect((result as Request).url).toBe(nativeRequest.url)
    expect((result as Request).headers.get("x-request-id")).toBe("request-1")
    expect(await (result as Request).json()).toEqual({ email: "test@example.com" })
  })

  it("rejects a declared oversized body without reading it", async () => {
    const request = new Request("https://example.invalid", {
      method: "POST",
      headers: { "content-length": "100" },
      body: "hello",
    })
    const result = await limitRequestBody(request, 10)

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(413)
  })

  it("rejects a streamed body that exceeds the limit", async () => {
    const request = new Request("https://example.invalid", { method: "POST", body: "too long" })
    request.headers.delete("content-length")
    const result = await limitRequestBody(request, 3)

    expect(result).toBeInstanceOf(Response)
    expect((result as Response).status).toBe(413)
  })
})
