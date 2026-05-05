import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "@twt/db"
import { user as authUsers } from "@twt/db/auth-schema"
import { db } from "@twt/db/client"
import {
  type Experiment,
  type ExperimentEntry,
  type GalleryImage,
  type Recipe,
  type Wine,
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
  return value && Number.isFinite(value) ? value : null
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

function isManagedImageValue(value: string): boolean {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    managedImagePrefixes.some((prefix) => value.startsWith(prefix))
  )
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

  return trimmed
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

const recipeInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.enum(difficultyEnum),
  prepTime: z.number().nullable().optional(),
  cookTime: z.number().nullable().optional(),
  servings: z.number().nullable().optional(),
  ingredientsText: z.string().min(1),
  instructionsText: z.string().min(1),
  tipsText: z.string().optional(),
  image: z.string().optional(),
  published: z.boolean(),
  featured: z.boolean(),
})

const wineInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  winery: z.string().min(1),
  region: z.string().optional(),
  country: z.string().optional(),
  vintage: z.number().nullable().optional(),
  type: z.enum(wineTypeEnum),
  grapes: z.string().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  notes: z.string().optional(),
  aromasText: z.string().optional(),
  pairingsText: z.string().optional(),
  priceRange: z.enum(priceRangeEnum).nullable().optional(),
  occasion: z.string().optional(),
  image: z.string().optional(),
  published: z.boolean(),
  featured: z.boolean(),
})

const experimentEntryInputSchema = z.object({
  id: z.string().uuid().optional(),
  entryType: z.enum(experimentEntryTypeEnum),
  content: z.string().min(1),
  imagesText: z.string().optional(),
  sortOrder: z.number().int().min(0),
})

const experimentInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  status: z.enum(experimentStatusEnum),
  hypothesis: z.string().optional(),
  result: z.string().optional(),
  recipeId: z.string().uuid().nullable().optional(),
  image: z.string().optional(),
  published: z.boolean(),
  featured: z.boolean(),
  entries: z.array(experimentEntryInputSchema),
})

const galleryInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
  image: z.string().min(1),
  category: z.enum(galleryCategoryEnum),
  sortOrder: z.number().int().min(0),
  published: z.boolean(),
  featured: z.boolean(),
  takenAt: z.string().optional(),
})

const deleteInputSchema = z.object({
  kind: z.enum(["recipe", "wine", "experiment", "gallery"]),
  id: z.string().uuid(),
})

const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "user"]),
})

const siteDraftInputSchema = z.object({
  draft: z.custom<JsonObject>(
    (value) => typeof value === "object" && value !== null && !Array.isArray(value),
  ),
})

const siteDraftSettingKey = "site-draft"

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
  .inputValidator(siteDraftInputSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()
    validateSiteDraftImages(data.draft)

    const [saved] = await db
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

    return (saved?.value as JsonObject | undefined) ?? data.draft
  })

export const updateAdminUserRole = createServerFn({ method: "POST" })
  .inputValidator(updateUserRoleSchema)
  .handler(async ({ data }) => {
    const currentUser = await requireAdminUser()

    if (currentUser.id === data.userId && data.role !== "admin") {
      throw new Error("Keep your own account as an admin.")
    }

    const targetUser = await db.query.user.findFirst({
      where: (fields, operators) => operators.eq(fields.id, data.userId),
    })

    if (!targetUser) {
      throw new Error("User not found.")
    }

    if (normalizeRole(targetUser.role) === "admin" && data.role !== "admin") {
      const adminUsers = await db.query.user.findMany({
        where: (fields, operators) => operators.eq(fields.role, "admin"),
      })

      if (adminUsers.length <= 1) {
        throw new Error("Keep at least one admin account.")
      }
    }

    const [updatedUser] = await db
      .update(authUsers)
      .set({ role: data.role })
      .where(eq(authUsers.id, data.userId))
      .returning()

    if (!updatedUser) {
      throw new Error("Updated user could not be loaded.")
    }

    return mapAdminUserRecord(updatedUser)
  })

export const saveRecipe = createServerFn({ method: "POST" })
  .inputValidator(recipeInputSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

    const values = {
      title: data.title.trim(),
      slug: slugify(data.slug?.trim() || data.title),
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

    if (data.id) {
      const [updated] = await db
        .update(recipes)
        .set(values)
        .where(eq(recipes.id, data.id))
        .returning()
      return updated
    }

    const [created] = await db.insert(recipes).values(values).returning()
    return created
  })

export const saveWine = createServerFn({ method: "POST" })
  .inputValidator(wineInputSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

    const values = {
      name: data.name.trim(),
      slug: slugify(data.slug?.trim() || data.name),
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

    if (data.id) {
      const [updated] = await db.update(wines).set(values).where(eq(wines.id, data.id)).returning()
      return updated
    }

    const [created] = await db.insert(wines).values(values).returning()
    return created
  })

export const saveExperiment = createServerFn({ method: "POST" })
  .inputValidator(experimentInputSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

    const experimentValues = {
      title: data.title.trim(),
      slug: slugify(data.slug?.trim() || data.title),
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
        experimentId = updated!.id
        await tx.delete(experimentEntries).where(eq(experimentEntries.experimentId, experimentId))
      } else {
        const [created] = await tx.insert(experiments).values(experimentValues).returning()
        experimentId = created!.id
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
      const savedEntries = await tx
        .select()
        .from(experimentEntries)
        .where(eq(experimentEntries.experimentId, experimentId!))
        .orderBy(desc(experimentEntries.createdAt))

      return {
        ...experiment!,
        entries: savedEntries,
      }
    })

    return savedExperiment
  })

export const saveGalleryImage = createServerFn({ method: "POST" })
  .inputValidator(galleryInputSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

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

    if (data.id) {
      const [updated] = await db
        .update(galleryImages)
        .set(values)
        .where(eq(galleryImages.id, data.id))
        .returning()
      return updated
    }

    const [created] = await db.insert(galleryImages).values(values).returning()
    return created
  })

export const deleteRecord = createServerFn({ method: "POST" })
  .inputValidator(deleteInputSchema)
  .handler(async ({ data }) => {
    await requireAdminUser()

    if (data.kind === "recipe") {
      await db.delete(recipes).where(eq(recipes.id, data.id))
    }

    if (data.kind === "wine") {
      await db.delete(wines).where(eq(wines.id, data.id))
    }

    if (data.kind === "experiment") {
      await db.delete(experiments).where(eq(experiments.id, data.id))
    }

    if (data.kind === "gallery") {
      await db.delete(galleryImages).where(eq(galleryImages.id, data.id))
    }

    return { success: true, id: data.id, kind: data.kind }
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
