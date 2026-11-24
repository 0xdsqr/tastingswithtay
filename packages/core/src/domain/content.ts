/**
 * Public content models shared by the HTTP API, its typed client, and the UI.
 * Pure schemas only: nothing here may import server code.
 */
import {
  difficultyEnum,
  experimentEntryTypeEnum,
  experimentStatusEnum,
  galleryCategoryEnum,
  priceRangeEnum,
  tagTypeEnum,
  wineTypeEnum,
} from "@twt/database/enums"
import { Schema } from "effect"

export const Difficulty = Schema.Literals(difficultyEnum)
export const WineType = Schema.Literals(wineTypeEnum)
export const PriceRange = Schema.Literals(priceRangeEnum)
export const TagType = Schema.Literals(tagTypeEnum)
export const ExperimentStatus = Schema.Literals(experimentStatusEnum)
export const ExperimentEntryType = Schema.Literals(experimentEntryTypeEnum)
export const GalleryCategory = Schema.Literals(galleryCategoryEnum)

export const Slug = Schema.String.check(
  Schema.isMinLength(1),
  Schema.isMaxLength(256),
  Schema.isPattern(/^[a-z0-9-]+$/),
)

export const IngredientGroup = Schema.Struct({
  group: Schema.optional(Schema.String),
  items: Schema.Array(Schema.String),
})

export const InstructionStep = Schema.Struct({
  step: Schema.Number,
  text: Schema.String,
})

export const Tag = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  slug: Schema.String,
  type: Schema.String,
  createdAt: Schema.Date,
})
export type Tag = typeof Tag.Type

export const Recipe = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  slug: Schema.String,
  description: Schema.String,
  category: Schema.String,
  difficulty: Schema.String,
  prepTime: Schema.NullOr(Schema.Number),
  cookTime: Schema.NullOr(Schema.Number),
  servings: Schema.NullOr(Schema.Number),
  ingredients: Schema.Array(IngredientGroup),
  instructions: Schema.Array(InstructionStep),
  tips: Schema.Array(Schema.String),
  image: Schema.NullOr(Schema.String),
  published: Schema.Boolean,
  featured: Schema.Boolean,
  viewCount: Schema.Number,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})
export type Recipe = typeof Recipe.Type

export const Wine = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  slug: Schema.String,
  winery: Schema.String,
  region: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  vintage: Schema.NullOr(Schema.Number),
  type: Schema.String,
  grapes: Schema.NullOr(Schema.String),
  rating: Schema.NullOr(Schema.Number),
  notes: Schema.NullOr(Schema.String),
  aromas: Schema.Array(Schema.String),
  pairings: Schema.Array(Schema.String),
  priceRange: Schema.NullOr(Schema.String),
  occasion: Schema.NullOr(Schema.String),
  image: Schema.NullOr(Schema.String),
  published: Schema.Boolean,
  featured: Schema.Boolean,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})
export type Wine = typeof Wine.Type

export const Experiment = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  slug: Schema.String,
  description: Schema.String,
  status: Schema.String,
  hypothesis: Schema.NullOr(Schema.String),
  result: Schema.NullOr(Schema.String),
  recipeId: Schema.NullOr(Schema.String),
  image: Schema.NullOr(Schema.String),
  published: Schema.Boolean,
  featured: Schema.Boolean,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})
export type Experiment = typeof Experiment.Type

export const ExperimentEntry = Schema.Struct({
  id: Schema.String,
  experimentId: Schema.String,
  content: Schema.String,
  entryType: Schema.String,
  images: Schema.Array(Schema.String),
  sortOrder: Schema.Number,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})
export type ExperimentEntry = typeof ExperimentEntry.Type

export const ExperimentDetail = Schema.Struct({
  ...Experiment.fields,
  entries: Schema.Array(ExperimentEntry),
  tags: Schema.Array(Tag),
})
export type ExperimentDetail = typeof ExperimentDetail.Type

export const GalleryImage = Schema.Struct({
  id: Schema.String,
  title: Schema.NullOr(Schema.String),
  caption: Schema.NullOr(Schema.String),
  image: Schema.String,
  category: Schema.String,
  sortOrder: Schema.Number,
  published: Schema.Boolean,
  featured: Schema.Boolean,
  takenAt: Schema.NullOr(Schema.Date),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
})
export type GalleryImage = typeof GalleryImage.Type

/** Published site copy: a free-form JSON object edited in the admin app. */
export const SitePublication = Schema.Record(Schema.String, Schema.Unknown)
export type SitePublication = typeof SitePublication.Type
