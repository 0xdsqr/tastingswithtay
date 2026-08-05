import { describe, expect, it } from "vitest"
import { isCalloutLine, parseCalloutBlocks, stripCalloutMarker } from "./callout"

describe("callout syntax", () => {
  it("recognizes and removes the standard blockquote marker", () => {
    expect(isCalloutLine("> A kitchen note")).toBe(true)
    expect(isCalloutLine(">A kitchen note")).toBe(true)
    expect(isCalloutLine("Use > as needed")).toBe(false)
    expect(stripCalloutMarker("  > A kitchen note  ")).toBe("A kitchen note")
  })

  it("groups consecutive callout lines without swallowing regular items", () => {
    expect(
      parseCalloutBlocks(
        [
          "1 bottle Burgundy wine",
          "> Recipes often call for 3 cups, which is essentially the whole bottle.",
          "> If it's not a work day, pour yourself a small glass while you cook.",
          "Baby bella mushrooms",
        ],
        (item) => item,
      ),
    ).toEqual([
      { type: "items", items: ["1 bottle Burgundy wine"] },
      {
        type: "callout",
        text: "Recipes often call for 3 cups, which is essentially the whole bottle. If it's not a work day, pour yourself a small glass while you cook.",
      },
      { type: "items", items: ["Baby bella mushrooms"] },
    ])
  })

  it("works with structured content through a text selector", () => {
    const steps = [
      { step: 1, text: "Brown the roast." },
      { step: 2, text: "> The darker the fond, the richer the sauce." },
      { step: 3, text: "Add the wine." },
    ]

    expect(parseCalloutBlocks(steps, (item) => item.text)).toEqual([
      { type: "items", items: [steps[0]] },
      { type: "callout", text: "The darker the fond, the richer the sauce." },
      { type: "items", items: [steps[2]] },
    ])
  })
})
