const DEFAULT_APP_PORT = "3011"

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

function getDefaultLocalBaseUrl(): string {
  return `http://localhost:${process.env.PORT || DEFAULT_APP_PORT}`
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
