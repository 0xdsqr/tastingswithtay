import { assert, it } from "@effect/vitest"
import { Effect } from "effect"
import { imageFor, parseInstructions, parseStringList, requireSlug } from "./normalize"

it.effect("derives a URL slug from free text", () =>
  Effect.gen(function* () {
    assert.strictEqual(yield* requireSlug("  Tay's Lemon   Tart! "), "tays-lemon-tart")
    assert.strictEqual((yield* Effect.flip(requireSlug("!!!")))._tag, "AdminError")
  }),
)

it.effect("numbers instruction lines and requires at least one", () =>
  Effect.gen(function* () {
    assert.deepStrictEqual(yield* parseInstructions("Mix\n\nBake"), [
      { step: 1, text: "Mix" },
      { step: 2, text: "Bake" },
    ])
    assert.strictEqual(
      (yield* Effect.flip(parseInstructions("  \n "))).message,
      "Add at least one instruction.",
    )
  }),
)

it.effect("requires an uploaded image only when publishing", () =>
  Effect.gen(function* () {
    assert.isUndefined(yield* imageFor(false, "", "Hero image"))
    assert.strictEqual(
      (yield* Effect.flip(imageFor(true, "", "Hero image"))).message,
      "Hero image is required before publishing.",
    )
    assert.strictEqual(
      yield* imageFor(true, "/api/images/recipes/a.webp", "Hero image"),
      "/recipes/a.webp",
    )
  }),
)

it.effect("refuses images that were not uploaded through the app", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(
      imageFor(false, "https://elsewhere.example/a.jpg", "Hero image"),
    )
    assert.strictEqual(
      error.message,
      "Hero image must be uploaded through the image field before saving.",
    )
  }),
)

it("splits multi-line fields into trimmed, non-empty entries", () => {
  assert.deepStrictEqual(parseStringList(" a \n\n b\n"), ["a", "b"])
  assert.deepStrictEqual(parseStringList(undefined), [])
})
