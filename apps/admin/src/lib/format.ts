import { isCalloutLine } from "@twt/react/lib/callout"

export function toNumberOrNull(value: string): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function humanizeExperimentStatus(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function initialsFor(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "?"

  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)
}

export function splitPreviewLines(value: string | null | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export type IngredientGroup = {
  group?: string
  items: string[]
}

export function parseIngredientGroups(value: string | null | undefined): IngredientGroup[] {
  const groups: IngredientGroup[] = []
  let currentGroup: IngredientGroup = { items: [] }

  const flushGroup = () => {
    if (currentGroup.items.length > 0) {
      groups.push(currentGroup)
    }
  }

  for (const rawLine of (value ?? "").split("\n")) {
    const line = rawLine.trim()

    if (!line) {
      flushGroup()
      currentGroup = { items: [] }
      continue
    }

    if (!isCalloutLine(line) && line.endsWith(":")) {
      flushGroup()
      currentGroup = {
        group: line.slice(0, -1).trim(),
        items: [],
      }
      continue
    }

    currentGroup.items.push(line.replace(/^[-*]\s*/, ""))
  }

  flushGroup()
  return groups
}

export function parseInstructionLines(value: string | null | undefined): string[] {
  return splitPreviewLines(value).map((line) => line.replace(/^\d+[.)]\s*/, ""))
}

export function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function upsertByUpdatedAt<T extends { id: string; updatedAt?: Date | string }>(
  items: T[],
  nextItem: T,
): T[] {
  return [nextItem, ...items.filter((item) => item.id !== nextItem.id)].sort((left, right) => {
    const leftValue = left.updatedAt ? new Date(left.updatedAt).getTime() : 0
    const rightValue = right.updatedAt ? new Date(right.updatedAt).getTime() : 0
    return rightValue - leftValue
  })
}
