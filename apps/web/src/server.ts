import { createServerEntry } from "@tanstack/react-start/server-entry"
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server"
import { withSecurityHeaders } from "@twt/core/http/security"

const startHandler = createStartHandler(defaultStreamHandler)

export default createServerEntry({
  async fetch(request) {
    return withSecurityHeaders(await startHandler(request))
  },
})
