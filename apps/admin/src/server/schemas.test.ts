import { Effect, Schema } from "effect"
import { describe, expect, it } from "vitest"
import { GalleryInput, RecipeInput, SiteDraftInput, UpdateUserRoleInput } from "./schemas"

const recipe = {
  title: "  Lemon Tart  ",
  description: "Bright and sharp",
  category: "Dessert",
  difficulty: "Easy",
  ingredientsText: "lemons",
  instructionsText: "bake",
  published: false,
  featured: false,
}

const decodes = <A>(schema: Schema.Codec<A>, input: unknown): boolean =>
  Effect.runSync(Effect.isSuccess(Schema.decodeUnknownEffect(schema)(input)))

describe("RecipeInput", () => {
  it("trims text fields while decoding", () => {
    expect(Schema.decodeUnknownSync(RecipeInput)(recipe).title).toBe("Lemon Tart")
  })

  it("rejects blank required text, unknown difficulties, and malformed slugs", () => {
    expect(decodes(RecipeInput, { ...recipe, title: "   " })).toBe(false)
    expect(decodes(RecipeInput, { ...recipe, difficulty: "Impossible" })).toBe(false)
    expect(decodes(RecipeInput, { ...recipe, slug: "Not A Slug" })).toBe(false)
  })

  it("accepts null or omitted optional numbers but not out-of-range ones", () => {
    expect(decodes(RecipeInput, { ...recipe, prepTime: null })).toBe(true)
    expect(decodes(RecipeInput, { ...recipe, prepTime: 0 })).toBe(false)
    expect(decodes(RecipeInput, { ...recipe, servings: 2.5 })).toBe(false)
  })
})

describe("GalleryInput", () => {
  const image = {
    image: "/gallery/a.webp",
    category: "garden",
    sortOrder: 0,
    published: false,
    featured: false,
  }

  it("accepts an ISO date or an empty date field", () => {
    expect(decodes(GalleryInput, { ...image, takenAt: "2026-05-01" })).toBe(true)
    expect(decodes(GalleryInput, { ...image, takenAt: "" })).toBe(true)
    expect(decodes(GalleryInput, { ...image, takenAt: "May 1st" })).toBe(false)
  })
})

describe("UpdateUserRoleInput", () => {
  it("only allows the two known roles", () => {
    expect(decodes(UpdateUserRoleInput, { userId: "u1", role: "admin" })).toBe(true)
    expect(decodes(UpdateUserRoleInput, { userId: "u1", role: "owner" })).toBe(false)
  })
})

describe("SiteDraftInput", () => {
  it("rejects drafts with missing sections", () => {
    expect(decodes(SiteDraftInput, { draft: { home: {} } })).toBe(false)
  })
})
