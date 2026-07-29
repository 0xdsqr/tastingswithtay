import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { getAdminUserFromHeaders } from "./admin-access-server"

export type SessionUser = {
  id?: string | null
  email?: string | null
  name?: string | null
  role?: string | null
}

export const getAdminSessionUser = createServerFn({ method: "GET" }).handler(() =>
  getAdminUserFromHeaders(getRequestHeaders()),
)
