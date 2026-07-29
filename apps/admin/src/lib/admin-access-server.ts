import { db } from "@twt/database/client"
import { auth } from "../auth/server"
import type { SessionUser } from "./admin-access"

// Server-only module (imported from API routes and server-fn handlers).
// admin-access.ts must keep only createServerFn/type exports so the client
// compiler can strip it.

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

/** Resolves the admin user for an arbitrary request — usable from API route handlers. */
export async function getAdminUserFromHeaders(headers: Headers): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers })

  if (!session?.user) {
    return null
  }

  return lookupAdminUser(session.user)
}
