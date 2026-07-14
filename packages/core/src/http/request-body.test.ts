import { describe, expect, it } from "vitest"
import { limitRequestBody } from "./request-body"

describe("limitRequestBody", () => {
  it("preserves an in-budget request body", async () => {
    const request = new Request("https://example.invalid", { method: "POST", body: "hello" })
    const result = await limitRequestBody(request, 10)

    expect(result).toBeInstanceOf(Request)
    expect(await (result as Request).text()).toBe("hello")
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
