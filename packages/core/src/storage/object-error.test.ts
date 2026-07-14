import { describe, expect, it } from "vitest"
import { isMissingObjectError } from "./object-error"

describe("isMissingObjectError", () => {
  it("recognizes missing S3 objects", () => {
    expect(isMissingObjectError(Object.assign(new Error("missing"), { name: "NoSuchKey" }))).toBe(
      true,
    )
    expect(isMissingObjectError({ name: "NotFound" })).toBe(true)
  })

  it("does not hide storage or credential failures", () => {
    expect(isMissingObjectError({ name: "NoSuchBucket" })).toBe(false)
    expect(isMissingObjectError({ name: "AccessDenied" })).toBe(false)
    expect(isMissingObjectError(new Error("network failure"))).toBe(false)
  })
})
