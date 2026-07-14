import { createServerFn } from "@tanstack/react-start"
import { desc, eq, sql } from "@twt/db"
import { session as authSessions, user as authUsers } from "@twt/db/auth-schema"
import { db } from "@twt/db/client"
import {
  type Experiment,
  type ExperimentEntry,
  type GalleryImage,
  type Recipe,
  type Wine,
  adminAuditLog,
  difficultyEnum,
  experimentEntries,
  experimentEntryTypeEnum,
  experimentStatusEnum,
  experiments,
  galleryCategoryEnum,
  galleryImages,
  priceRangeEnum,
  recipes,
  siteSettings,
  wineTypeEnum,
  wines,
} from "@twt/db/schema"
import { z } from "zod"
import { getAdminSessionUser } from "./admin-access"

type SessionUser = {
  id?: string | null
  email?: string | null
  name?: string | null
  role?: string | null
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function requireSlug(value: string): string {
  const slug = slugify(value)
  if (!slug) throw new Error("Add a slug using lowercase letters, numbers, or hyphens.")
  return slug
}

function parseStringList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseIngredients(value: string): Array<{ group?: string; items: string[] }> {
  const lines = value.split("\n")
  const groups: Array<{ group?: string; items: string[] }> = []
  let currentGroup: { group?: string; items: string[] } = { items: [] }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      if (currentGroup.items.length > 0) {
        groups.push(currentGroup)
        currentGroup = { items: [] }
      }
      continue
    }

    if (line.endsWith(":")) {
      if (currentGroup.items.length > 0) {
        groups.push(currentGroup)
      }
      currentGroup = {
        group: line.slice(0, -1).trim(),
        items: [],
      }
      continue
    }

    currentGroup.items.push(line.replace(/^[-*]\s*/, ""))
  }

  if (currentGroup.items.length > 0) {
    groups.push(currentGroup)
  }

  if (groups.length === 0) {
    throw new Error("Add at least one ingredient.")
  }

  return groups
}

function formatIngredients(value: Array<{ group?: string; items: string[] }>): string {
  return value
    .flatMap((group) => {
      const lines: string[] = []
      if (group.group) {
        lines.push(`${group.group}:`)
      }
      lines.push(...group.items)
      return [...lines, ""]
    })
    .join("\n")
    .trim()
}

function parseInstructions(value: string): Array<{ step: number; text: string }> {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+[.)]\s*/, ""))

  if (lines.length === 0) {
    throw new Error("Add at least one instruction.")
  }

  return lines.map((text, index) => ({
    step: index + 1,
    text,
  }))
}

function formatInstructions(value: Array<{ step: number; text: string }>): string {
  return value.map((item) => item.text).join("\n")
}

function toNullableNumber(value: number | null | undefined): number | null {
  return value !== null && value !== undefined && Number.isFinite(value) ? value : null
}

function toNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const managedImagePrefixes = [
  "/about/",
  "/recipes/",
  "/wines/",
  "/experiments/",
  "/gallery/",
  "/brand/",
  "/system/",
  "/uploads/",
] as const

const managedImageProxyPrefix = "/api/images/"
const managedImageHosts = new Set([
  "admin.tastingswithtay.com",
  "cdn.dsqr.dev",
  "s3.dsqr.dev",
  "tastingswithtay.com",
])

function isManagedImageValue(value: string): boolean {
  return Boolean(managedImagePathFor(value))
}

function managedImagePathFor(value: string): string | null {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    let url: URL
    try {
      url = new URL(value)
    } catch {
      return null
    }

    if (!managedImageHosts.has(url.hostname)) return null
    return managedImagePathFor(url.pathname)
  }

  let pathname = value
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

function normalizeManagedImage(
  value: string | null | undefined,
  label: string,
): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  if (!isManagedImageValue(trimmed)) {
    throw new Error(`${label} must be uploaded through the image field before saving.`)
  }

  return managedImagePathFor(trimmed) ?? undefined
}

function requireManagedImage(value: string | null | undefined, label: string): string {
  const image = normalizeManagedImage(value, label)
  if (!image) {
    throw new Error(`${label} is required before publishing.`)
  }

  return image
}

function parseManagedImageList(value: string | null | undefined, label: string): string[] {
  return parseStringList(value ?? "").map((image) => requireManagedImage(image, label))
}

function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

function normalizeRole(value: string | string[] | null | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null
  }

  return value?.trim() || null
}

function mapAdminUserRecord(value: {
  id: string
  name: string
  email: string
  role?: string | string[] | null
  emailVerified?: boolean | null
  banned?: boolean | null
  createdAt: Date
  updatedAt: Date
}): AdminUserRecord {
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    role: normalizeRole(value.role),
    emailVerified: Boolean(value.emailVerified),
    banned: value.banned ?? null,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

const shortText = z.string().trim().min(1).max(256)
const longText = z.string().trim().max(20_000)
const managedImageInput = z.string().trim().max(512).optional()
const optionalSlug = z
  .string()
  .trim()
  .max(256)
  .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers, and hyphens for slugs.")
  .optional()

const recipeInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: shortText,
  slug: optionalSlug,
  description: z.string().trim().min(1).max(20_000),
  category: z.string().trim().min(1).max(100),
  difficulty: z.enum(difficultyEnum),
  prepTime: z.number().int().positive().max(10_080).nullable().optional(),
  cookTime: z.number().int().positive().max(10_080).nullable().optional(),
  servings: z.number().int().positive().max(10_000).nullable().optional(),
  ingredientsText: z.string().trim().min(1).max(50_000),
  instructionsText: z.string().trim().min(1).max(100_000),
  tipsText: z.string().max(50_000).optional(),
  image: managedImageInput,
  published: z.boolean(),
  featured: z.boolean(),
})

const wineInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: shortText,
  slug: optionalSlug,
  winery: shortText,
  region: z.string().trim().max(256).optional(),
  country: z.string().trim().max(100).optional(),
  vintage: z.number().int().min(1800).max(2200).nullable().optional(),
  type: z.enum(wineTypeEnum),
  grapes: z.string().trim().max(256).optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  notes: longText.optional(),
  aromasText: z.string().max(20_000).optional(),
  pairingsText: z.string().max(20_000).optional(),
  priceRange: z.enum(priceRangeEnum).nullable().optional(),
  occasion: z.string().trim().max(100).optional(),
  image: managedImageInput,
  published: z.boolean(),
  featured: z.boolean(),
})

const experimentEntryInputSchema = z.object({
  id: z.string().uuid().optional(),
  entryType: z.enum(experimentEntryTypeEnum),
  content: z.string().trim().min(1).max(5_000),
  imagesText: z.string().max(10_000).optional(),
  sortOrder: z.number().int().min(0).max(100_000),
})

const experimentInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: shortText,
  slug: optionalSlug,
  description: z.string().trim().min(1).max(20_000),
  status: z.enum(experimentStatusEnum),
  hypothesis: longText.optional(),
  result: longText.optional(),
  recipeId: z.string().uuid().nullable().optional(),
  image: managedImageInput,
  published: z.boolean(),
  featured: z.boolean(),
  entries: z.array(experimentEntryInputSchema).max(100),
})

const galleryInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().max(256).optional(),
  caption: z.string().trim().max(2_000).optional(),
  image: z.string().trim().min(1).max(512),
  category: z.enum(galleryCategoryEnum),
  sortOrder: z.number().int().min(0).max(100_000),
  published: z.boolean(),
  featured: z.boolean(),
  takenAt: z.iso.date().optional(),
})

const deleteInputSchema = z.object({
  kind: z.enum(["recipe", "wine", "experiment", "gallery"]),
  id: z.string().uuid(),
})

const updateUserRoleSchema = z.object({
  userId: z.string().min(1).max(256),
  role: z.enum(["admin", "user"]),
})

const siteContentText = z.string().max(20_000)
const siteHeadingText = z.string().max(256)
const localHref = z
  .string()
  .max(2_048)
  .regex(/^\/(?!\/)/, "Site links must be root-relative paths.")

const siteDraftSchema = z
  .object({
    home: z
      .object({
        heroFallbackEyebrow: siteHeadingText,
        heroFallbackTitle: siteHeadingText,
        heroFallbackBody: siteContentText,
        primaryCtaLabel: siteHeadingText,
        primaryCtaHref: localHref,
        secondaryCtaLabel: siteHeadingText,
        secondaryCtaHref: localHref,
        bentoEyebrow: siteHeadingText,
        bentoTitle: siteHeadingText,
        storiesEyebrow: siteHeadingText,
        storiesTitle: siteHeadingText,
        storiesEmptyHeading: siteHeadingText,
        storiesEmptyBody: siteContentText,
      })
      .strict(),
    about: z
      .object({
        heroEyebrow: siteHeadingText,
        heroTitle: siteHeadingText,
        heroImage: z.string().max(512),
        introBody: siteContentText,
        philosophyEyebrow: siteHeadingText,
        philosophyTitle: siteHeadingText,
        philosophyBody: siteContentText,
        valuesEyebrow: siteHeadingText,
        valuesTitle: siteHeadingText,
        values: z
          .array(
            z
              .object({
                id: z
                  .string()
                  .min(1)
                  .max(100)
                  .regex(/^[a-zA-Z0-9_-]+$/),
                title: siteHeadingText,
                body: siteContentText,
              })
              .strict(),
          )
          .max(12),
        quoteText: siteContentText,
        quoteAuthor: siteHeadingText,
        quoteImage: z.string().max(512),
        whatsIncludedEyebrow: siteHeadingText,
        whatsIncludedTitle: siteHeadingText,
        whatsIncludedBody: siteContentText,
        whatsIncludedImage: z.string().max(512),
        connectEyebrow: siteHeadingText,
        connectTitle: siteHeadingText,
        connectBody: siteContentText,
      })
      .strict(),
    newsletter: z
      .object({
        eyebrow: siteHeadingText,
        title: siteHeadingText,
        body: siteContentText,
        privacyNote: siteContentText,
      })
      .strict(),
  })
  .strict()

const siteDraftInputSchema = z.object({ draft: siteDraftSchema }).strict()

const siteDraftSettingKey = "site-draft"
const sitePublicationSettingKey = "site-publication"

function asJsonObject(value: JsonValue | undefined): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return value
}

function validateSiteDraftImages(draft: JsonObject): void {
  const about = asJsonObject(draft.about)
  const imageFields = [
    ["heroImage", "About hero image"],
    ["quoteImage", "Quote image"],
    ["whatsIncludedImage", "What you'll find image"],
  ] as const

  for (const [field, label] of imageFields) {
    const value = about[field]
    if (typeof value === "string") {
      normalizeManagedImage(value, label)
    }
  }
}

async function requireAdminUser(): Promise<SessionUser> {
  const user = await getAdminSessionUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }

  return user
}

function actorId(user: SessionUser): string {
  if (!user.id) throw new Error("Authenticated admin has no user id.")
  return user.id
}

export const getAdminBootstrap = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireAdminUser()

  const [recipeRows, wineRows, experimentRows, entryRows, galleryRows, userRows, siteDraftRows] =
    await Promise.all([
      db.select().from(recipes).orderBy(desc(recipes.updatedAt)),
      db.select().from(wines).orderBy(desc(wines.updatedAt)),
      db.select().from(experiments).orderBy(desc(experiments.updatedAt)),
      db.select().from(experimentEntries).orderBy(desc(experimentEntries.createdAt)),
      db.select().from(galleryImages).orderBy(desc(galleryImages.updatedAt)),
      db.select().from(authUsers).orderBy(desc(authUsers.createdAt)),
      db.select().from(siteSettings).where(eq(siteSettings.key, siteDraftSettingKey)).limit(1),
    ])

  const entriesByExperimentId = new Map<string, typeof entryRows>()
  for (const entry of entryRows) {
    const existing = entriesByExperimentId.get(entry.experimentId) ?? []
    existing.push(entry)
    entriesByExperimentId.set(entry.experimentId, existing)
  }

  const users = userRows.map((entry) =>
    mapAdminUserRecord({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      role: entry.role,
      emailVerified: entry.emailVerified,
      banned: entry.banned,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }),
  )

  return {
    user,
    users,
    recipes: recipeRows,
    wines: wineRows,
    experiments: experimentRows.map((experiment) => ({
      ...experiment,
      entries: entriesByExperimentId.get(experiment.id) ?? [],
    })),
    gallery: galleryRows,
    siteDraft: (siteDraftRows[0]?.value as JsonObject | undefined) ?? null,
  }
})

export const saveSiteDraft = createServerFn({ method: "POST" })
  .validator(siteDraftInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()
    validateSiteDraftImages(data.draft)

    return db.transaction(async (tx) => {
      const [saved] = await tx
        .insert(siteSettings)
        .values({
          key: siteDraftSettingKey,
          value: data.draft,
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value: data.draft,
            updatedAt: new Date(),
          },
        })
        .returning()

      await tx.insert(adminAuditLog).values({
        actorUserId: actorId(actor),
        action: "site.draft.save",
        targetType: "site",
        targetId: siteDraftSettingKey,
        metadata: {},
      })

      return (saved?.value as JsonObject | undefined) ?? data.draft
    })
  })

export const publishSiteDraft = createServerFn({ method: "POST" }).handler(async () => {
  const actor = await requireAdminUser()

  return db.transaction(async (tx) => {
    const [draft] = await tx
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, siteDraftSettingKey))
      .limit(1)

    if (!draft) throw new Error("Save the site draft before publishing it.")
    validateSiteDraftImages(draft.value as JsonObject)

    const [publication] = await tx
      .insert(siteSettings)
      .values({ key: sitePublicationSettingKey, value: draft.value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: draft.value, updatedAt: new Date() },
      })
      .returning()

    await tx.insert(adminAuditLog).values({
      actorUserId: actorId(actor),
      action: "site.publish",
      targetType: "site",
      targetId: sitePublicationSettingKey,
      metadata: {},
    })

    return (publication?.value as JsonObject | undefined) ?? (draft.value as JsonObject)
  })
})

export const updateAdminUserRole = createServerFn({ method: "POST" })
  .validator(updateUserRoleSchema)
  .handler(async ({ data }) => {
    const currentUser = await requireAdminUser()

    if (currentUser.id === data.userId && data.role !== "admin") {
      throw new Error("Keep your own account as an admin.")
    }

    const updatedUser = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('twt-admin-role-update'))`)

      const [targetUser] = await tx
        .select()
        .from(authUsers)
        .where(eq(authUsers.id, data.userId))
        .limit(1)
      if (!targetUser) throw new Error("User not found.")

      if (normalizeRole(targetUser.role) === "admin" && data.role !== "admin") {
        const adminUsers = await tx
          .select({ id: authUsers.id })
          .from(authUsers)
          .where(eq(authUsers.role, "admin"))
        if (adminUsers.length <= 1) throw new Error("Keep at least one admin account.")
      }

      const [updated] = await tx
        .update(authUsers)
        .set({ role: data.role })
        .where(eq(authUsers.id, data.userId))
        .returning()
      if (!updated) throw new Error("Updated user could not be loaded.")

      await tx.delete(authSessions).where(eq(authSessions.userId, data.userId))
      await tx.insert(adminAuditLog).values({
        actorUserId: actorId(currentUser),
        action: "user.role.update",
        targetType: "user",
        targetId: data.userId,
        metadata: { from: normalizeRole(targetUser.role), to: data.role },
      })

      return updated
    })

    return mapAdminUserRecord(updatedUser)
  })

export const saveRecipe = createServerFn({ method: "POST" })
  .validator(recipeInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()

    const values = {
      title: data.title.trim(),
      slug: requireSlug(data.slug?.trim() || data.title),
      description: data.description.trim(),
      category: data.category.trim(),
      difficulty: data.difficulty,
      prepTime: toNullableNumber(data.prepTime),
      cookTime: toNullableNumber(data.cookTime),
      servings: toNullableNumber(data.servings),
      ingredients: parseIngredients(data.ingredientsText),
      instructions: parseInstructions(data.instructionsText),
      tips: parseStringList(data.tipsText ?? ""),
      image: data.published
        ? requireManagedImage(data.image, "Recipe hero image")
        : normalizeManagedImage(data.image, "Recipe hero image"),
      published: data.published,
      featured: data.featured,
    }

    return db.transaction(async (tx) => {
      if (data.id) {
        const [updated] = await tx
          .update(recipes)
          .set(values)
          .where(eq(recipes.id, data.id))
          .returning()
        if (!updated) throw new Error("Recipe not found.")
        await tx.insert(adminAuditLog).values({
          actorUserId: actorId(actor),
          action: "recipe.update",
          targetType: "recipe",
          targetId: updated.id,
          metadata: { published: updated.published },
        })
        return updated
      }

      const [created] = await tx.insert(recipes).values(values).returning()
      if (!created) throw new Error("Recipe could not be created.")
      await tx.insert(adminAuditLog).values({
        actorUserId: actorId(actor),
        action: "recipe.create",
        targetType: "recipe",
        targetId: created.id,
        metadata: { published: created.published },
      })
      return created
    })
  })

export const saveWine = createServerFn({ method: "POST" })
  .validator(wineInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()

    const values = {
      name: data.name.trim(),
      slug: requireSlug(data.slug?.trim() || data.name),
      winery: data.winery.trim(),
      region: toNullableString(data.region) ?? undefined,
      country: toNullableString(data.country) ?? undefined,
      vintage: toNullableNumber(data.vintage),
      type: data.type,
      grapes: toNullableString(data.grapes) ?? undefined,
      rating: toNullableNumber(data.rating),
      notes: toNullableString(data.notes) ?? undefined,
      aromas: parseStringList(data.aromasText ?? ""),
      pairings: parseStringList(data.pairingsText ?? ""),
      priceRange: data.priceRange ?? null,
      occasion: toNullableString(data.occasion) ?? undefined,
      image: data.published
        ? requireManagedImage(data.image, "Wine image")
        : normalizeManagedImage(data.image, "Wine image"),
      published: data.published,
      featured: data.featured,
    }

    return db.transaction(async (tx) => {
      if (data.id) {
        const [updated] = await tx
          .update(wines)
          .set(values)
          .where(eq(wines.id, data.id))
          .returning()
        if (!updated) throw new Error("Wine not found.")
        await tx.insert(adminAuditLog).values({
          actorUserId: actorId(actor),
          action: "wine.update",
          targetType: "wine",
          targetId: updated.id,
          metadata: { published: updated.published },
        })
        return updated
      }

      const [created] = await tx.insert(wines).values(values).returning()
      if (!created) throw new Error("Wine could not be created.")
      await tx.insert(adminAuditLog).values({
        actorUserId: actorId(actor),
        action: "wine.create",
        targetType: "wine",
        targetId: created.id,
        metadata: { published: created.published },
      })
      return created
    })
  })

export const saveExperiment = createServerFn({ method: "POST" })
  .validator(experimentInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()

    const experimentValues = {
      title: data.title.trim(),
      slug: requireSlug(data.slug?.trim() || data.title),
      description: data.description.trim(),
      status: data.status,
      hypothesis: toNullableString(data.hypothesis) ?? undefined,
      result: toNullableString(data.result) ?? undefined,
      recipeId: data.recipeId ?? null,
      image: data.published
        ? requireManagedImage(data.image, "Experiment hero image")
        : normalizeManagedImage(data.image, "Experiment hero image"),
      published: data.published,
      featured: data.featured,
    }

    const savedExperiment = await db.transaction(async (tx) => {
      let experimentId = data.id

      if (experimentId) {
        const [updated] = await tx
          .update(experiments)
          .set(experimentValues)
          .where(eq(experiments.id, experimentId))
          .returning()
        if (!updated) throw new Error("Experiment not found.")
        experimentId = updated.id
        await tx.delete(experimentEntries).where(eq(experimentEntries.experimentId, experimentId))
      } else {
        const [created] = await tx.insert(experiments).values(experimentValues).returning()
        if (!created) throw new Error("Experiment could not be created.")
        experimentId = created.id
      }

      if (data.entries.length > 0) {
        await tx.insert(experimentEntries).values(
          data.entries.map((entry, index) => ({
            experimentId: experimentId!,
            content: entry.content.trim(),
            entryType: entry.entryType,
            images: parseManagedImageList(entry.imagesText, "Experiment entry image"),
            sortOrder: entry.sortOrder ?? index,
          })),
        )
      }

      const [experiment] = await tx
        .select()
        .from(experiments)
        .where(eq(experiments.id, experimentId!))
      if (!experiment) throw new Error("Saved experiment could not be loaded.")
      const savedEntries = await tx
        .select()
        .from(experimentEntries)
        .where(eq(experimentEntries.experimentId, experimentId!))
        .orderBy(desc(experimentEntries.createdAt))

      await tx.insert(adminAuditLog).values({
        actorUserId: actorId(actor),
        action: data.id ? "experiment.update" : "experiment.create",
        targetType: "experiment",
        targetId: experiment.id,
        metadata: { published: experiment.published },
      })

      return {
        ...experiment,
        entries: savedEntries,
      }
    })

    return savedExperiment
  })

export const saveGalleryImage = createServerFn({ method: "POST" })
  .validator(galleryInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()

    const values = {
      title: toNullableString(data.title) ?? undefined,
      caption: toNullableString(data.caption) ?? undefined,
      image: data.published
        ? requireManagedImage(data.image, "Gallery image")
        : (normalizeManagedImage(data.image, "Gallery image") ?? ""),
      category: data.category,
      sortOrder: data.sortOrder,
      published: data.published,
      featured: data.featured,
      takenAt: data.takenAt ? new Date(data.takenAt) : null,
    }

    return db.transaction(async (tx) => {
      if (data.id) {
        const [updated] = await tx
          .update(galleryImages)
          .set(values)
          .where(eq(galleryImages.id, data.id))
          .returning()
        if (!updated) throw new Error("Gallery image not found.")
        await tx.insert(adminAuditLog).values({
          actorUserId: actorId(actor),
          action: "gallery.update",
          targetType: "gallery",
          targetId: updated.id,
          metadata: { published: updated.published },
        })
        return updated
      }

      const [created] = await tx.insert(galleryImages).values(values).returning()
      if (!created) throw new Error("Gallery image could not be created.")
      await tx.insert(adminAuditLog).values({
        actorUserId: actorId(actor),
        action: "gallery.create",
        targetType: "gallery",
        targetId: created.id,
        metadata: { published: created.published },
      })
      return created
    })
  })

export const deleteRecord = createServerFn({ method: "POST" })
  .validator(deleteInputSchema)
  .handler(async ({ data }) => {
    const actor = await requireAdminUser()

    return db.transaction(async (tx) => {
      let deleted = false

      if (data.kind === "recipe") {
        const [row] = await tx
          .delete(recipes)
          .where(eq(recipes.id, data.id))
          .returning({ id: recipes.id })
        deleted = Boolean(row)
      }

      if (data.kind === "wine") {
        const [row] = await tx
          .delete(wines)
          .where(eq(wines.id, data.id))
          .returning({ id: wines.id })
        deleted = Boolean(row)
      }

      if (data.kind === "experiment") {
        const [row] = await tx
          .delete(experiments)
          .where(eq(experiments.id, data.id))
          .returning({ id: experiments.id })
        deleted = Boolean(row)
      }

      if (data.kind === "gallery") {
        const [row] = await tx
          .delete(galleryImages)
          .where(eq(galleryImages.id, data.id))
          .returning({ id: galleryImages.id })
        deleted = Boolean(row)
      }

      if (!deleted) throw new Error(`${data.kind} not found.`)

      await tx.insert(adminAuditLog).values({
        actorUserId: actorId(actor),
        action: `${data.kind}.delete`,
        targetType: data.kind,
        targetId: data.id,
        metadata: {},
      })

      return { success: true, id: data.id, kind: data.kind }
    })
  })

export function createEmptyRecipe() {
  return {
    title: "",
    slug: "",
    description: "",
    category: "",
    difficulty: "Easy" as (typeof difficultyEnum)[number],
    prepTime: null as number | null,
    cookTime: null as number | null,
    servings: null as number | null,
    ingredientsText: "",
    instructionsText: "",
    tipsText: "",
    image: "",
    published: false,
    featured: false,
  }
}

export function createEmptyWine() {
  return {
    name: "",
    slug: "",
    winery: "",
    region: "",
    country: "",
    vintage: null as number | null,
    type: "Red" as (typeof wineTypeEnum)[number],
    grapes: "",
    rating: null as number | null,
    notes: "",
    aromasText: "",
    pairingsText: "",
    priceRange: null as (typeof priceRangeEnum)[number] | null,
    occasion: "",
    image: "",
    published: false,
    featured: false,
  }
}

export function createEmptyExperimentEntry() {
  return {
    id: undefined as string | undefined,
    entryType: "update" as (typeof experimentEntryTypeEnum)[number],
    content: "",
    imagesText: "",
    sortOrder: 0,
  }
}

export function createEmptyExperiment() {
  return {
    title: "",
    slug: "",
    description: "",
    status: "in_progress" as (typeof experimentStatusEnum)[number],
    hypothesis: "",
    result: "",
    recipeId: null as string | null,
    image: "",
    published: false,
    featured: false,
    entries: [createEmptyExperimentEntry()],
  }
}

export function createEmptyGalleryImage() {
  return {
    title: "",
    caption: "",
    image: "",
    category: "garden" as (typeof galleryCategoryEnum)[number],
    sortOrder: 0,
    published: false,
    featured: false,
    takenAt: "",
  }
}

export function mapRecipeToForm(item: Recipe) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    category: item.category,
    difficulty: item.difficulty as (typeof difficultyEnum)[number],
    prepTime: item.prepTime,
    cookTime: item.cookTime,
    servings: item.servings,
    ingredientsText: formatIngredients(item.ingredients),
    instructionsText: formatInstructions(item.instructions),
    tipsText: (item.tips ?? []).join("\n"),
    image: item.image ?? "",
    published: item.published,
    featured: item.featured,
  }
}

export function mapWineToForm(item: Wine) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    winery: item.winery,
    region: item.region ?? "",
    country: item.country ?? "",
    vintage: item.vintage,
    type: item.type as (typeof wineTypeEnum)[number],
    grapes: item.grapes ?? "",
    rating: item.rating,
    notes: item.notes ?? "",
    aromasText: (item.aromas ?? []).join("\n"),
    pairingsText: (item.pairings ?? []).join("\n"),
    priceRange: (item.priceRange as (typeof priceRangeEnum)[number] | null) ?? null,
    occasion: item.occasion ?? "",
    image: item.image ?? "",
    published: item.published,
    featured: item.featured,
  }
}

export function mapExperimentToForm(item: Experiment & { entries: ExperimentEntry[] }) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    status: item.status as (typeof experimentStatusEnum)[number],
    hypothesis: item.hypothesis ?? "",
    result: item.result ?? "",
    recipeId: item.recipeId ?? null,
    image: item.image ?? "",
    published: item.published,
    featured: item.featured,
    entries:
      item.entries.length > 0
        ? item.entries.map((entry, index) => ({
            id: entry.id,
            entryType: entry.entryType as (typeof experimentEntryTypeEnum)[number],
            content: entry.content,
            imagesText: (entry.images ?? []).join("\n"),
            sortOrder: entry.sortOrder ?? index,
          }))
        : [createEmptyExperimentEntry()],
  }
}

export function mapGalleryToForm(item: GalleryImage) {
  return {
    id: item.id,
    title: item.title ?? "",
    caption: item.caption ?? "",
    image: item.image,
    category: item.category as (typeof galleryCategoryEnum)[number],
    sortOrder: item.sortOrder,
    published: item.published,
    featured: item.featured,
    takenAt: toDateInputValue(item.takenAt),
  }
}

export function formatAdminDate(value: string | Date | null | undefined): string {
  if (!value) return "Not set"
  return new Date(value).toLocaleString()
}
