import { createServerEntry } from "@tanstack/react-start/server-entry"
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server"
import { ProcessEnvConfig, isProduction } from "@twt/core/config"
import { createNonce, withSecurityHeaders } from "@twt/core/http/security"
import { Effect } from "effect"

const startHandler = createStartHandler(defaultStreamHandler)
const production = Effect.runSync(isProduction.pipe(Effect.provide(ProcessEnvConfig), Effect.orDie))

export default createServerEntry({
  async fetch(request) {
    // The router stamps this nonce on every script it renders; the CSP header then allows only those.
    const nonce = createNonce()
    const response = await startHandler(request, { context: { nonce } })
    return withSecurityHeaders(response, { nonce, isProduction: production })
  },
})
