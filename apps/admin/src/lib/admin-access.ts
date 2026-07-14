import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { db } from "@twt/db/client"
import { auth } from "../auth/server"

export type SessionUser = {
  id?: string | null
  email?: string | null
  name?: string | null
  role?: string | null
}

function isAdminUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false

  return user.role?.toLowerCase() === "admin"
}

async function lookupAdminUser(user: SessionUser | null | undefined): Promise<SessionUser | null> {
  if (!user) return null
  if (!user.id) return null

  const dbUser =
    (await db.query.user.findFirst({
      where: (fields, operators) => operators.eq(fields.id, user.id!),
    })) ?? null

  if (!dbUser || !isAdminUser(dbUser) || dbUser.banned) return null
  return dbUser
}

async function getAdminSessionUserFromRequest(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  })

  if (!session?.user) {
    return null
  }

  return lookupAdminUser(session.user)
}

export const getAdminSessionUser = createServerFn({ method: "GET" }).handler(() =>
  getAdminSessionUserFromRequest(),
)
