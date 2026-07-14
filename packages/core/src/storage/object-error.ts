function errorName(error: unknown): string | undefined {
  if (error instanceof Error) return error.name
  if (typeof error !== "object" || !error || !("name" in error)) return undefined
  return typeof error.name === "string" ? error.name : undefined
}

export function isMissingObjectError(error: unknown): boolean {
  const name = errorName(error)
  return name === "NoSuchKey" || name === "NotFound"
}
