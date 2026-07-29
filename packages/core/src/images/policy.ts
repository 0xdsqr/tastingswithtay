/**
 * Single source of truth for what counts as a "managed image" — an object that
 * lives in the RustFS bucket and is served through the /api/images proxy.
 * Pure string logic only: this module is imported from both server and client code.
 */

export const managedAssetFolders = [
  "about",
  "recipes",
  "wines",
  "experiments",
  "gallery",
  "brand",
  "system",
  "uploads",
] as const

export type ManagedAssetFolder = (typeof managedAssetFolders)[number]

export const managedImageProxyPrefix = "/api/images/"

const managedImagePrefixes = managedAssetFolders.map((folder) => `/${folder}/`)

const managedImageHosts = new Set([
  "admin.tastingswithtay.com",
  "cdn.dsqr.dev",
  "s3.dsqr.dev",
  "tastingswithtay.com",
])

export function isManagedAssetFolder(value: string | undefined): value is ManagedAssetFolder {
  return Boolean(value) && (managedAssetFolders as readonly string[]).includes(value!)
}

/**
 * Normalizes any accepted spelling of a managed image (absolute URL on a known
 * host, /api/images proxy path, bucket-prefixed path, or bare folder path) to
 * its canonical `/folder/file` form. Returns null for anything else.
 */
export function managedImagePathFor(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      return null
    }

    if (!managedImageHosts.has(url.hostname)) return null
    return managedImagePathFor(url.pathname)
  }

  let pathname = trimmed
  if (pathname.startsWith(managedImageProxyPrefix)) {
    pathname = `/${pathname.slice(managedImageProxyPrefix.length)}`
  }

  if (pathname.startsWith("/tastingswithtay/")) {
    pathname = pathname.slice("/tastingswithtay".length)
  }

  if (!managedImagePrefixes.some((prefix) => pathname.startsWith(prefix))) return null
  if (pathname.includes("..") || pathname.includes("//")) return null

  return pathname
}

export function isManagedImageValue(value: string | null | undefined): boolean {
  return Boolean(managedImagePathFor(value))
}

/** Same-origin proxy URL for a managed image value, or null when unmanaged. */
export function managedImageProxySrc(value: string | null | undefined): string | null {
  const managedPath = managedImagePathFor(value)
  if (!managedPath) return null

  return `${managedImageProxyPrefix}${managedPath.slice(1)}`
}
