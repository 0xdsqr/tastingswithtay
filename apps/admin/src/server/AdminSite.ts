import type { DatabaseError } from "@twt/core/domain/errors"
import { Database } from "@twt/core/services/Database"
import { desc, eq, sql } from "@twt/database"
import { session as authSessions, user as authUsers } from "@twt/database/auth-schema"
import { adminAuditLog, siteSettings } from "@twt/database/schema"
import { Context, DateTime, Effect, Layer, Predicate } from "effect"
import { CurrentAdmin } from "./AdminAccess"
import { AdminError } from "./errors"
import { normalizeManagedImage } from "./normalize"
import type { SiteDraft, UpdateUserRoleInput } from "./schemas"
import { type Transaction, transaction } from "./transaction"

const draftKey = "site-draft"
const publicationKey = "site-publication"

type JsonValue = string | number | boolean | null | Array<JsonValue> | { [key: string]: JsonValue }

/** Site copy as stored: a JSON object whose shape `SiteDraft` validates on the way in. */
export type SiteContent = { [key: string]: JsonValue }

export type AdminUserRecord = {
  id: string
  name: string
  email: string
  role: string | null
  emailVerified: boolean
  banned: boolean | null
  createdAt: Date
  updatedAt: Date
}

export type DashboardActivityEntry = {
  id: string
  action: string
  targetType: string
  targetId: string
  actorName: string
  createdAt: Date
}

export type DashboardData = {
  stats: {
    recipes: number
    publishedRecipes: number
    wines: number
    publishedWines: number
    experiments: number
    publishedExperiments: number
    gallery: number
    publishedGallery: number
    users: number
    admins: number
  }
  activity: Array<DashboardActivityEntry>
}

type Failure = AdminError | DatabaseError

const toUserRecord = (user: typeof authUsers.$inferSelect): AdminUserRecord => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role?.trim() || null,
  emailVerified: Boolean(user.emailVerified),
  banned: user.banned ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const aboutImageFields = [
  ["heroImage", "About hero image"],
  ["quoteImage", "Quote image"],
  ["whatsIncludedImage", "What you'll find image"],
] as const

/** Every image referenced by site copy must be a managed upload. */
const validateImages = (content: SiteContent) => {
  const about = Predicate.isObject(content.about) ? content.about : {}
  return Effect.forEach(
    aboutImageFields,
    ([field, label]) => {
      const value = (about as Record<string, unknown>)[field]
      return Predicate.isString(value)
        ? Effect.asVoid(normalizeManagedImage(value, label))
        : Effect.void
    },
    { discard: true },
  )
}

/** Site copy drafts and publication, the dashboard summary, and administrator roles. */
export class AdminSite extends Context.Service<
  AdminSite,
  {
    readonly draft: Effect.Effect<SiteContent | null, DatabaseError>
    saveDraft(draft: SiteDraft): Effect.Effect<SiteContent, Failure, CurrentAdmin>
    readonly publishDraft: Effect.Effect<SiteContent, Failure, CurrentAdmin>
    readonly dashboard: Effect.Effect<DashboardData, DatabaseError>
    readonly listUsers: Effect.Effect<Array<AdminUserRecord>, DatabaseError>
    updateUserRole(
      input: UpdateUserRoleInput,
    ): Effect.Effect<AdminUserRecord, Failure, CurrentAdmin>
  }
>()("admin/server/AdminSite") {
  static readonly layerNoDeps = Layer.effect(
    AdminSite,
    Effect.gen(function* () {
      const database = yield* Database
      const inTransaction = <A>(operation: string, run: (tx: Transaction) => Promise<A>) =>
        Effect.provideService(transaction(operation, run), Database, database)

      const draft = database
        .query("admin.site.draft", (db) =>
          db.select().from(siteSettings).where(eq(siteSettings.key, draftKey)).limit(1),
        )
        .pipe(Effect.map((rows) => (rows[0]?.value as SiteContent | undefined) ?? null))

      const saveDraft = Effect.fn("AdminSite.saveDraft")(function* (content: SiteDraft) {
        const actor = yield* CurrentAdmin
        const value = content as unknown as SiteContent
        yield* validateImages(value)
        const now = DateTime.toDateUtc(yield* DateTime.now)

        return yield* inTransaction("site.draft.save", async (tx) => {
          const [saved] = await tx
            .insert(siteSettings)
            .values({ key: draftKey, value })
            .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: now } })
            .returning()
          await tx.insert(adminAuditLog).values({
            actorUserId: actor.id,
            action: "site.draft.save",
            targetType: "site",
            targetId: draftKey,
            metadata: {},
          })
          return (saved?.value as SiteContent | undefined) ?? value
        })
      })

      const publishDraft = Effect.gen(function* () {
        const actor = yield* CurrentAdmin
        const current = yield* draft
        if (!current) {
          return yield* new AdminError({ message: "Save the site draft before publishing it." })
        }
        yield* validateImages(current)
        const now = DateTime.toDateUtc(yield* DateTime.now)

        return yield* inTransaction("site.publish", async (tx) => {
          const [publication] = await tx
            .insert(siteSettings)
            .values({ key: publicationKey, value: current })
            .onConflictDoUpdate({
              target: siteSettings.key,
              set: { value: current, updatedAt: now },
            })
            .returning()
          await tx.insert(adminAuditLog).values({
            actorUserId: actor.id,
            action: "site.publish",
            targetType: "site",
            targetId: publicationKey,
            metadata: {},
          })
          return (publication?.value as SiteContent | undefined) ?? current
        })
      }).pipe(Effect.withSpan("AdminSite.publishDraft"))

      const dashboard = Effect.gen(function* () {
        const [counts, activity] = yield* Effect.all(
          [
            database.query("admin.dashboard.counts", (db) =>
              db.execute<{
                recipes: number
                published_recipes: number
                wines: number
                published_wines: number
                experiments: number
                published_experiments: number
                gallery: number
                published_gallery: number
                users: number
                admins: number
              }>(sql`
                SELECT
                  (SELECT count(*) FROM recipes)::int AS recipes,
                  (SELECT count(*) FROM recipes WHERE published)::int AS published_recipes,
                  (SELECT count(*) FROM wines)::int AS wines,
                  (SELECT count(*) FROM wines WHERE published)::int AS published_wines,
                  (SELECT count(*) FROM experiments)::int AS experiments,
                  (SELECT count(*) FROM experiments WHERE published)::int AS published_experiments,
                  (SELECT count(*) FROM gallery_images)::int AS gallery,
                  (SELECT count(*) FROM gallery_images WHERE published)::int AS published_gallery,
                  (SELECT count(*) FROM "user")::int AS users,
                  (SELECT count(*) FROM "user" WHERE role = 'admin')::int AS admins
              `),
            ),
            database.query("admin.dashboard.activity", (db) =>
              db
                .select({
                  id: adminAuditLog.id,
                  action: adminAuditLog.action,
                  targetType: adminAuditLog.targetType,
                  targetId: adminAuditLog.targetId,
                  actorName: authUsers.name,
                  createdAt: adminAuditLog.createdAt,
                })
                .from(adminAuditLog)
                .innerJoin(authUsers, eq(adminAuditLog.actorUserId, authUsers.id))
                .orderBy(desc(adminAuditLog.createdAt))
                .limit(12),
            ),
          ],
          { concurrency: 2 },
        )
        const stats = counts.rows[0]

        return {
          stats: {
            recipes: stats?.recipes ?? 0,
            publishedRecipes: stats?.published_recipes ?? 0,
            wines: stats?.wines ?? 0,
            publishedWines: stats?.published_wines ?? 0,
            experiments: stats?.experiments ?? 0,
            publishedExperiments: stats?.published_experiments ?? 0,
            gallery: stats?.gallery ?? 0,
            publishedGallery: stats?.published_gallery ?? 0,
            users: stats?.users ?? 0,
            admins: stats?.admins ?? 0,
          },
          activity,
        }
      }).pipe(Effect.withSpan("AdminSite.dashboard"))

      const listUsers = database
        .query("admin.users.list", (db) =>
          db.select().from(authUsers).orderBy(desc(authUsers.createdAt)),
        )
        .pipe(Effect.map((rows) => rows.map(toUserRecord)))

      const updateUserRole = Effect.fn("AdminSite.updateUserRole")(function* (
        input: UpdateUserRoleInput,
      ) {
        const actor = yield* CurrentAdmin
        if (actor.id === input.userId && input.role !== "admin") {
          return yield* new AdminError({ message: "Keep your own account as an admin." })
        }

        return yield* inTransaction("users.role.update", async (tx) => {
          // Serializes role changes so two demotions cannot race past the last-admin check.
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('twt-admin-role-update'))`)

          const [target] = await tx
            .select()
            .from(authUsers)
            .where(eq(authUsers.id, input.userId))
            .limit(1)
          if (!target) throw new AdminError({ message: "User not found." })

          const previousRole = target.role?.trim() || null
          if (previousRole === "admin" && input.role !== "admin") {
            const admins = await tx
              .select({ id: authUsers.id })
              .from(authUsers)
              .where(eq(authUsers.role, "admin"))
            if (admins.length <= 1) {
              throw new AdminError({ message: "Keep at least one admin account." })
            }
          }

          const [updated] = await tx
            .update(authUsers)
            .set({ role: input.role })
            .where(eq(authUsers.id, input.userId))
            .returning()
          if (!updated) throw new AdminError({ message: "Updated user could not be loaded." })

          // Existing sessions carry the old role, so they are revoked.
          await tx.delete(authSessions).where(eq(authSessions.userId, input.userId))
          await tx.insert(adminAuditLog).values({
            actorUserId: actor.id,
            action: "user.role.update",
            targetType: "user",
            targetId: input.userId,
            metadata: { from: previousRole, to: input.role },
          })
          return toUserRecord(updated)
        })
      })

      return AdminSite.of({ draft, saveDraft, publishDraft, dashboard, listUsers, updateUserRole })
    }),
  )
}
