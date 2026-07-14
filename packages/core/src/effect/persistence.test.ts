import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { PersistenceError, tryPersistence } from "./persistence"

describe("tryPersistence", () => {
  it.effect("preserves successful values", () =>
    Effect.gen(function* () {
      const value = yield* tryPersistence("test.success", async () => 42)
      expect(value).toBe(42)
    }),
  )

  it.effect("maps rejected promises to a typed, non-sensitive error", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        tryPersistence("test.failure", async () => {
          throw new Error("postgres://user:secret@example.invalid")
        }),
      )

      expect(error).toBeInstanceOf(PersistenceError)
      expect(error.operation).toBe("test.failure")
      expect(JSON.stringify(error)).not.toContain("secret")
    }),
  )
})

it("constructs the public error without retaining the original cause", () => {
  const error = new PersistenceError({ operation: "test", message: "Error" })
  expect(JSON.stringify(error)).not.toContain("secret")
})
