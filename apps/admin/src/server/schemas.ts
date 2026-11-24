/**
 * Input schemas for the admin server functions. Pure, so the same definitions
 * validate on the server and type the forms in the browser.
 */
import {
  difficultyEnum,
  experimentEntryTypeEnum,
  experimentStatusEnum,
  galleryCategoryEnum,
  priceRangeEnum,
  wineTypeEnum,
} from "@twt/database/enums"
import { managedAssetFolders } from "@twt/core/images/policy"
import { Schema } from "effect"

const trimmed = (minimum: number, maximum: number) =>
  Schema.Trim.check(Schema.isMinLength(minimum), Schema.isMaxLength(maximum))
const text = (maximum: number) => Schema.String.check(Schema.isMaxLength(maximum))
const int = (minimum: number, maximum: number) =>
  Schema.Int.check(Schema.isBetween({ minimum, maximum }))
const nullableInt = (minimum: number, maximum: number) =>
  Schema.optional(Schema.NullOr(int(minimum, maximum)))

const Id = Schema.String.check(Schema.isUUID())
const ShortText = trimmed(1, 256)
const LongText = Schema.optional(trimmed(0, 20_000))
const ManagedImageInput = Schema.optional(trimmed(0, 512))
const OptionalSlug = Schema.optional(
  trimmed(0, 256).check(
    Schema.isPattern(/^[a-z0-9-]*$/, {
      message: "Use lowercase letters, numbers, and hyphens for slugs.",
    }),
  ),
)

export const RecipeInput = Schema.Struct({
  id: Schema.optional(Id),
  title: ShortText,
  slug: OptionalSlug,
  description: trimmed(1, 20_000),
  category: trimmed(1, 100),
  difficulty: Schema.Literals(difficultyEnum),
  prepTime: nullableInt(1, 10_080),
  cookTime: nullableInt(1, 10_080),
  servings: nullableInt(1, 10_000),
  ingredientsText: trimmed(1, 50_000),
  instructionsText: trimmed(1, 100_000),
  tipsText: Schema.optional(text(50_000)),
  image: ManagedImageInput,
  published: Schema.Boolean,
  featured: Schema.Boolean,
})
export type RecipeInput = typeof RecipeInput.Type

export const WineInput = Schema.Struct({
  id: Schema.optional(Id),
  name: ShortText,
  slug: OptionalSlug,
  winery: ShortText,
  region: Schema.optional(trimmed(0, 256)),
  country: Schema.optional(trimmed(0, 100)),
  vintage: nullableInt(1800, 2200),
  type: Schema.Literals(wineTypeEnum),
  grapes: Schema.optional(trimmed(0, 256)),
  rating: nullableInt(1, 5),
  notes: LongText,
  aromasText: Schema.optional(text(20_000)),
  pairingsText: Schema.optional(text(20_000)),
  priceRange: Schema.optional(Schema.NullOr(Schema.Literals(priceRangeEnum))),
  occasion: Schema.optional(trimmed(0, 100)),
  image: ManagedImageInput,
  published: Schema.Boolean,
  featured: Schema.Boolean,
})
export type WineInput = typeof WineInput.Type

const ExperimentEntryInput = Schema.Struct({
  id: Schema.optional(Id),
  entryType: Schema.Literals(experimentEntryTypeEnum),
  content: trimmed(1, 5_000),
  imagesText: Schema.optional(text(10_000)),
  sortOrder: int(0, 100_000),
})

export const ExperimentInput = Schema.Struct({
  id: Schema.optional(Id),
  title: ShortText,
  slug: OptionalSlug,
  description: trimmed(1, 20_000),
  status: Schema.Literals(experimentStatusEnum),
  hypothesis: LongText,
  result: LongText,
  recipeId: Schema.optional(Schema.NullOr(Id)),
  image: ManagedImageInput,
  published: Schema.Boolean,
  featured: Schema.Boolean,
  entries: Schema.Array(ExperimentEntryInput).check(Schema.isMaxLength(100)),
})
export type ExperimentInput = typeof ExperimentInput.Type

export const GalleryInput = Schema.Struct({
  id: Schema.optional(Id),
  title: Schema.optional(trimmed(0, 256)),
  caption: Schema.optional(trimmed(0, 2_000)),
  image: trimmed(1, 512),
  category: Schema.Literals(galleryCategoryEnum),
  sortOrder: int(0, 100_000),
  published: Schema.Boolean,
  featured: Schema.Boolean,
  takenAt: Schema.optional(
    Schema.String.check(
      Schema.isPattern(/^(\d{4}-\d{2}-\d{2})?$/, { message: "Use a YYYY-MM-DD date." }),
    ),
  ),
})
export type GalleryInput = typeof GalleryInput.Type

const recordKinds = ["recipe", "wine", "experiment", "gallery"] as const
export const DeleteInput = Schema.Struct({ kind: Schema.Literals(recordKinds), id: Id })
export type DeleteInput = typeof DeleteInput.Type

export const UpdateUserRoleInput = Schema.Struct({
  userId: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(256)),
  role: Schema.Literals(["admin", "user"]),
})
export type UpdateUserRoleInput = typeof UpdateUserRoleInput.Type

const Heading = text(256)
const Body = text(20_000)
const ImagePath = text(512)
const LocalHref = text(2_048).check(
  Schema.isPattern(/^\/(?!\/)/, { message: "Site links must be root-relative paths." }),
)

export const SiteDraft = Schema.Struct({
  home: Schema.Struct({
    heroFallbackEyebrow: Heading,
    heroFallbackTitle: Heading,
    heroFallbackBody: Body,
    primaryCtaLabel: Heading,
    primaryCtaHref: LocalHref,
    secondaryCtaLabel: Heading,
    secondaryCtaHref: LocalHref,
    bentoEyebrow: Heading,
    bentoTitle: Heading,
    storiesEyebrow: Heading,
    storiesTitle: Heading,
    storiesEmptyHeading: Heading,
    storiesEmptyBody: Body,
  }),
  about: Schema.Struct({
    heroEyebrow: Heading,
    heroTitle: Heading,
    heroImage: ImagePath,
    introBody: Body,
    philosophyEyebrow: Heading,
    philosophyTitle: Heading,
    philosophyBody: Body,
    valuesEyebrow: Heading,
    valuesTitle: Heading,
    values: Schema.Array(
      Schema.Struct({
        id: Schema.String.check(
          Schema.isMinLength(1),
          Schema.isMaxLength(100),
          Schema.isPattern(/^[a-zA-Z0-9_-]+$/),
        ),
        title: Heading,
        body: Body,
      }),
    ).check(Schema.isMaxLength(12)),
    quoteText: Body,
    quoteAuthor: Heading,
    quoteImage: ImagePath,
    whatsIncludedEyebrow: Heading,
    whatsIncludedTitle: Heading,
    whatsIncludedBody: Body,
    whatsIncludedImage: ImagePath,
    connectEyebrow: Heading,
    connectTitle: Heading,
    connectBody: Body,
  }),
  newsletter: Schema.Struct({
    eyebrow: Heading,
    title: Heading,
    body: Body,
    privacyNote: Body,
  }),
  gardenAndFlock: Schema.Struct({
    metaTitle: Heading,
    metaDescription: Body,
    heroTitle: Heading,
    heroBody: Body,
    allFilterLabel: Heading,
    gardenFilterLabel: Heading,
    flockFilterLabel: Heading,
    emptyAllHeading: Heading,
    emptyAllBody: Body,
    emptyGardenHeading: Heading,
    emptyGardenBody: Body,
    emptyFlockHeading: Heading,
    emptyFlockBody: Body,
  }),
})
export type SiteDraft = typeof SiteDraft.Type

export const SiteDraftInput = Schema.Struct({ draft: SiteDraft })

export const ListAssetsInput = Schema.optional(
  Schema.Struct({
    folder: Schema.optional(Schema.Literals(["all", ...managedAssetFolders])),
    limit: Schema.optional(int(1, 250)),
    cursor: Schema.optional(text(2_048)),
  }),
)

export const DeleteAssetInput = Schema.Struct({
  key: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(512)),
})
