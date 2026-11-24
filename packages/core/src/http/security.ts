/**
 * Browser hardening headers applied to every response. Scripts must carry the
 * per-request nonce; inline styles stay allowed because React and the UI
 * library set `style` attributes, which a nonce cannot cover.
 */
const contentSecurityPolicy = (nonce: string) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "upgrade-insecure-requests",
  ].join("; ")

/** A fresh, unguessable value for one response's `Content-Security-Policy`. */
export const createNonce = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return btoa(String.fromCharCode(...bytes))
}

export function withSecurityHeaders(
  response: Response,
  options: { readonly nonce: string; readonly isProduction: boolean },
): Response {
  const headers = new Headers(response.headers)
  headers.set("Content-Security-Policy", contentSecurityPolicy(options.nonce))
  headers.set("Cross-Origin-Opener-Policy", "same-origin")
  headers.set("Cross-Origin-Resource-Policy", "same-site")
  headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=()")
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("X-Frame-Options", "DENY")

  if (options.isProduction) {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
