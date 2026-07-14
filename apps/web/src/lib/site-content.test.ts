import { describe, expect, it } from "vitest"
import { getGardenAndFlockContent } from "./site-content"

const gardenAndFlockContent = {
  metaTitle: "Life outside | Tastings with Tay",
  metaDescription: "Notes from the garden and coop.",
  heroTitle: "Our garden and flock",
  heroBody: "See what is growing and hatching this week.",
  allFilterLabel: "Everything",
  gardenFilterLabel: "From the garden",
  flockFilterLabel: "From the coop",
  emptyAllHeading: "More soon",
  emptyAllBody: "We are gathering stories.",
  emptyGardenHeading: "The beds are resting",
  emptyGardenBody: "Try the coop while you wait.",
  emptyFlockHeading: "The coop is quiet",
  emptyFlockBody: "Try the garden while you wait.",
}

describe("getGardenAndFlockContent", () => {
  it("returns the published Garden & Flock content", () => {
    expect(getGardenAndFlockContent({ gardenAndFlock: gardenAndFlockContent })).toEqual(
      gardenAndFlockContent,
    )
  })

  it("uses safe defaults for missing or incomplete legacy publications", () => {
    expect(getGardenAndFlockContent(null).heroTitle).toBe("Garden & Flock")
    expect(
      getGardenAndFlockContent({ gardenAndFlock: { heroTitle: "Incomplete" } }).heroTitle,
    ).toBe("Garden & Flock")
  })
})
