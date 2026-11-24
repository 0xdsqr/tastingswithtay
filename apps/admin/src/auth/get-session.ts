import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { Auth } from "@twt/core/services/Auth"
import { runtime } from "../server/runtime"

export const getServerSession = createServerFn({ method: "GET" }).handler(() =>
  runtime.runPromise(Auth.use((auth) => auth.getSession(getRequestHeaders()))),
)
