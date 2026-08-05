import { describe, expect, it } from "vitest"
import { parseIngredientGroups, parseInstructionLines } from "./format"

describe("parseIngredientGroups", () => {
  it("preserves named recipe sections instead of turning headings into ingredients", () => {
    expect(
      parseIngredientGroups(`
Pork filling:
- 1 lb ground pork
* 2 cloves garlic

Shrimp filling:
1/2 lb shrimp
Sesame oil

Dipping sauce:
3 parts vinegar
1 part soy sauce
`),
    ).toEqual([
      { group: "Pork filling", items: ["1 lb ground pork", "2 cloves garlic"] },
      { group: "Shrimp filling", items: ["1/2 lb shrimp", "Sesame oil"] },
      { group: "Dipping sauce", items: ["3 parts vinegar", "1 part soy sauce"] },
    ])
  })

  it("supports an unnamed ingredient section", () => {
    expect(parseIngredientGroups("Salt\nPepper")).toEqual([{ items: ["Salt", "Pepper"] }])
  })

  it("preserves callout markers, including callouts that end in a colon", () => {
    expect(
      parseIngredientGroups(
        "Wine:\n1 bottle Burgundy\n> Kitchen note:\n> Save a small glass for the cook.",
      ),
    ).toEqual([
      {
        group: "Wine",
        items: ["1 bottle Burgundy", "> Kitchen note:", "> Save a small glass for the cook."],
      },
    ])
  })
})

describe("parseInstructionLines", () => {
  it("normalizes optional numbering and removes blank steps", () => {
    expect(parseInstructionLines("1. Prep\n\n2) Cook\nServe")).toEqual(["Prep", "Cook", "Serve"])
  })

  it("preserves callout markers while normalizing numbered steps", () => {
    expect(parseInstructionLines("1. Prep\n> Keep the pan hot.\n2. Cook")).toEqual([
      "Prep",
      "> Keep the pan hot.",
      "Cook",
    ])
  })
})
