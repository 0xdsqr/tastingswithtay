export type CalloutBlock<T> = { type: "items"; items: T[] } | { type: "callout"; text: string }

const calloutMarkerPattern = /^\s*>\s?/

export function isCalloutLine(value: string): boolean {
  return calloutMarkerPattern.test(value)
}

export function stripCalloutMarker(value: string): string {
  return value.replace(calloutMarkerPattern, "").trim()
}

export function parseCalloutBlocks<T>(items: T[], getText: (item: T) => string): CalloutBlock<T>[] {
  const blocks: CalloutBlock<T>[] = []
  let regularItems: T[] = []
  let calloutLines: string[] = []

  const flushRegularItems = (): void => {
    if (regularItems.length === 0) return
    blocks.push({ type: "items", items: regularItems })
    regularItems = []
  }

  const flushCallout = (): void => {
    if (calloutLines.length === 0) return
    const text = calloutLines.filter(Boolean).join(" ").trim()
    if (text) blocks.push({ type: "callout", text })
    calloutLines = []
  }

  for (const item of items) {
    const value = getText(item)

    if (isCalloutLine(value)) {
      flushRegularItems()
      calloutLines.push(stripCalloutMarker(value))
      continue
    }

    flushCallout()
    regularItems.push(item)
  }

  flushRegularItems()
  flushCallout()
  return blocks
}
