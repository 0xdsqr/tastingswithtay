const managedImagePrefixes = [
  "/about/",
  "/recipes/",
  "/wines/",
  "/experiments/",
  "/gallery/",
  "/brand/",
  "/system/",
  "/uploads/",
] as const

export function normalizeManagedImageUrl(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  if (managedImagePrefixes.some((prefix) => trimmed.startsWith(prefix))) {
    return trimmed
  }

  return undefined
}
