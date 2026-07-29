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
