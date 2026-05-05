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

const managedImageProxyPrefix = "/api/images/"
const managedImageHosts = new Set([
  "admin.tastingswithtay.com",
  "cdn.dsqr.dev",
  "s3.dsqr.dev",
  "tastingswithtay.com",
])

function managedImagePathFor(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  let pathname = trimmed
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      return undefined
    }

    if (!managedImageHosts.has(url.hostname)) return undefined
    pathname = url.pathname
  }

  if (pathname.startsWith(managedImageProxyPrefix)) {
    pathname = `/${pathname.slice(managedImageProxyPrefix.length)}`
  }

  if (pathname.startsWith("/tastingswithtay/")) {
    pathname = pathname.slice("/tastingswithtay".length)
  }

  if (!managedImagePrefixes.some((prefix) => pathname.startsWith(prefix))) return undefined
  if (pathname.includes("..") || pathname.includes("//")) return undefined

  return pathname
}

export function normalizeManagedImageUrl(value: string | null | undefined): string | undefined {
  const managedPath = managedImagePathFor(value)
  if (!managedPath) return undefined

  return `${managedImageProxyPrefix}${managedPath.slice(1)}`
}
