import { createServerFn } from "@tanstack/react-start"
import type {
  difficultyEnum,
  experimentEntryTypeEnum,
  experimentStatusEnum,
  galleryCategoryEnum,
  priceRangeEnum,
  wineTypeEnum,
} from "@twt/database/enums"
import type { Experiment, ExperimentEntry, GalleryImage, Recipe, Wine } from "@twt/database/schema"
import { Schema } from "effect"
import { AdminContent } from "../server/AdminContent"
import { AdminSite } from "../server/AdminSite"
import { runAdminMutation, runAdminQuery } from "../server/run"
import {
  DeleteInput,
  ExperimentInput,
  GalleryInput,
  RecipeInput,
  SiteDraftInput,
  UpdateUserRoleInput,
  WineInput,
} from "../server/schemas"

export type { AdminUserRecord, DashboardActivityEntry } from "../server/AdminSite"

// Server functions: each validates its input, authorizes the caller, and
// delegates to a service. Mutations additionally reject cross-site requests.

export const listRecipes = createServerFn({ method: "GET" }).handler(() =>
  runAdminQuery(AdminContent.use((content) => content.listRecipes)),
)

export const listWines = createServerFn({ method: "GET" }).handler(() =>
  runAdminQuery(AdminContent.use((content) => content.listWines)),
)

export const listExperiments = createServerFn({ method: "GET" }).handler(() =>
  runAdminQuery(AdminContent.use((content) => content.listExperiments)),
)

export const listGalleryImages = createServerFn({ method: "GET" }).handler(() =>
  runAdminQuery(AdminContent.use((content) => content.listGalleryImages)),
)

export const listAdminUsers = createServerFn({ method: "GET" }).handler(() =>
  runAdminQuery(AdminSite.use((site) => site.listUsers)),
)

export const getSiteDraft = createServerFn({ method: "GET" }).handler(() =>
  runAdminQuery(AdminSite.use((site) => site.draft)),
)

export const getDashboardData = createServerFn({ method: "GET" }).handler(() =>
  runAdminQuery(AdminSite.use((site) => site.dashboard)),
)

export const saveSiteDraft = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(SiteDraftInput))
  .handler(({ data }) => runAdminMutation(AdminSite.use((site) => site.saveDraft(data.draft))))

export const publishSiteDraft = createServerFn({ method: "POST" }).handler(() =>
  runAdminMutation(AdminSite.use((site) => site.publishDraft)),
)

export const updateAdminUserRole = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(UpdateUserRoleInput))
  .handler(({ data }) => runAdminMutation(AdminSite.use((site) => site.updateUserRole(data))))

export const saveRecipe = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(RecipeInput))
  .handler(({ data }) => runAdminMutation(AdminContent.use((content) => content.saveRecipe(data))))

export const saveWine = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(WineInput))
  .handler(({ data }) => runAdminMutation(AdminContent.use((content) => content.saveWine(data))))

export const saveExperiment = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(ExperimentInput))
  .handler(({ data }) =>
    runAdminMutation(AdminContent.use((content) => content.saveExperiment(data))),
  )

export const saveGalleryImage = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(GalleryInput))
  .handler(({ data }) =>
    runAdminMutation(AdminContent.use((content) => content.saveGalleryImage(data))),
  )

export const deleteRecord = createServerFn({ method: "POST" })
  .validator(Schema.toStandardSchemaV1(DeleteInput))
  .handler(({ data }) =>
    runAdminMutation(AdminContent.use((content) => content.deleteRecord(data))),
  )

// Form helpers shared with the browser.

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

function formatInstructions(value: Array<{ step: number; text: string }>): string {
  return value.map((item) => item.text).join("\n")
}

function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return ""
  return new Date(value).toISOString().slice(0, 10)
}

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
