const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https:",
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "upgrade-insecure-requests",
].join("; ")

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set("Content-Security-Policy", contentSecurityPolicy)
  headers.set("Cross-Origin-Opener-Policy", "same-origin")
  headers.set("Cross-Origin-Resource-Policy", "same-site")
  headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=()")
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("X-Frame-Options", "DENY")

  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
