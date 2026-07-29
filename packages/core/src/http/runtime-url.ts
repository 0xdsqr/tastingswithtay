function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

function getDefaultLocalBaseUrl(): string {
  return `http://localhost:${process.env.PORT || "3010"}`
}

export function getPublicBaseUrl(): string {
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.BASE_URL || getDefaultLocalBaseUrl()

  return trimTrailingSlash(baseUrl)
}

export function getTrustedOrigins(): string[] {
  const configuredOrigins = (process.env.TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  return Array.from(new Set([getPublicBaseUrl(), ...configuredOrigins]))
}

export function getTrpcBaseUrl(): string {
  // In the browser we always call the same-origin /api/trpc endpoint.
  if (typeof (globalThis as { window?: unknown }).window !== "undefined") {
    return ""
  }

  const baseUrl =
    process.env.INTERNAL_API_BASE_URL || process.env.BASE_URL || getDefaultLocalBaseUrl()

  return trimTrailingSlash(baseUrl)
}
