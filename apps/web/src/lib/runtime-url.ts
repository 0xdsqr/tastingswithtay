const DEFAULT_APP_PORT = "3010"

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

export function getServerBaseUrl(): string {
  const baseUrl =
    process.env.INTERNAL_API_BASE_URL ||
    process.env.BASE_URL ||
    `http://localhost:${process.env.PORT || DEFAULT_APP_PORT}`

  return trimTrailingSlash(baseUrl)
}

export function getTrpcBaseUrl(): string {
  if (typeof window !== "undefined") {
    return ""
  }

  return getServerBaseUrl()
}
