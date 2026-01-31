import { relations, sql } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import { user } from "./auth-schema"

// ============================================
// ENUMS (as string literals for simplicity)
// ============================================

export const difficultyEnum = ["Easy", "Medium", "Hard"] as const
export const wineTypeEnum = [
  "Red",
  "White",
  "Rosé",
  "Sparkling",
  "Dessert",
] as const
export const priceRangeEnum = ["$", "$$", "$$$", "$$$$", "$$$$$"] as const
export const tagTypeEnum = ["recipe", "wine", "experiment", "both"] as const
export const experimentStatusEnum = [
  "in_progress",
  "paused",
  "completed",
  "graduated",
] as const
export const experimentEntryTypeEnum = [
  "update",
  "photo",
  "note",
  "result",
  "iteration",
] as const

// ============================================
// TAGS (shared across recipes & wines)
// ============================================

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    type: varchar("type", { length: 50 }).notNull().default("both"), // recipe | wine | both
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tags_slug_idx").on(table.slug),
    index("tags_type_idx").on(table.type),
  ],
)

// ============================================
// RECIPES
// ============================================

export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(), // Main Course, Appetizer, Dessert, etc.
    difficulty: varchar("difficulty", { length: 50 }).notNull(), // Easy, Medium, Hard

    prepTime: integer("prep_time"), // minutes
    cookTime: integer("cook_time"), // minutes
    servings: integer("servings"),

    // JSON for structured data
    ingredients: jsonb("ingredients")
      .$type<Array<{ group?: string; items: string[] }>>()
      .notNull(),
    instructions: jsonb("instructions")
      .$type<Array<{ step: number; text: string }>>()
      .notNull(),
    tips: text("tips").array().default(sql`ARRAY[]::text[]`),

    image: varchar("image", { length: 512 }),

    published: boolean("published").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("recipes_slug_idx").on(table.slug),
    index("recipes_category_idx").on(table.category),
    index("recipes_difficulty_idx").on(table.difficulty),
    index("recipes_published_idx").on(table.published),
    index("recipes_featured_idx").on(table.featured),
    index("recipes_created_at_idx").on(sql`${table.createdAt} DESC`),
    index("recipes_published_created_idx").on(
      table.published,
      sql`${table.createdAt} DESC`,
    ),
  ],
)

// ============================================
// RECIPE TAGS (junction)
// ============================================

export const recipeTags = pgTable(
  "recipe_tags",
  {
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.recipeId, table.tagId] }),
    index("recipe_tags_recipe_id_idx").on(table.recipeId),
    index("recipe_tags_tag_id_idx").on(table.tagId),
  ],
)

// ============================================
// WINES
// ============================================

export const wines = pgTable(
  "wines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    winery: varchar("winery", { length: 256 }).notNull(),
    region: varchar("region", { length: 256 }),
    country: varchar("country", { length: 100 }),
    vintage: integer("vintage"),
    type: varchar("type", { length: 50 }).notNull(), // Red, White, Rosé, Sparkling, Dessert
    grapes: varchar("grapes", { length: 256 }), // Cabernet Sauvignon, Merlot, etc.

    rating: integer("rating"), // 1-5 (Tay's rating)
    notes: text("notes"), // Tasting notes

    aromas: text("aromas").array().default(sql`ARRAY[]::text[]`),
    pairings: text("pairings").array().default(sql`ARRAY[]::text[]`), // General food pairings

    priceRange: varchar("price_range", { length: 20 }), // $, $$, $$$, $$$$, $$$$$
    occasion: varchar("occasion", { length: 100 }), // Special Celebration, Everyday, Date Night

    image: varchar("image", { length: 512 }),

    published: boolean("published").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("wines_slug_idx").on(table.slug),
    index("wines_type_idx").on(table.type),
    index("wines_country_idx").on(table.country),
    index("wines_winery_idx").on(table.winery),
    index("wines_published_idx").on(table.published),
    index("wines_featured_idx").on(table.featured),
    index("wines_rating_idx").on(table.rating),
    index("wines_created_at_idx").on(sql`${table.createdAt} DESC`),
  ],
)

// ============================================
// WINE TAGS (junction)
// ============================================

export const wineTags = pgTable(
  "wine_tags",
  {
    wineId: uuid("wine_id")
      .notNull()
      .references(() => wines.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.wineId, table.tagId] }),
    index("wine_tags_wine_id_idx").on(table.wineId),
    index("wine_tags_tag_id_idx").on(table.tagId),
  ],
)

// ============================================
// RECIPE-WINE PAIRINGS (Tay's recommendations)
// ============================================

export const recipeWinePairings = pgTable(
  "recipe_wine_pairings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    wineId: uuid("wine_id")
      .notNull()
      .references(() => wines.id, { onDelete: "cascade" }),
    notes: text("notes"), // "The tannins complement the beef perfectly"
    isPrimary: boolean("is_primary").default(false).notNull(), // Featured pairing
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("recipe_wine_pairings_unique_idx").on(
      table.recipeId,
      table.wineId,
    ),
    index("recipe_wine_pairings_recipe_id_idx").on(table.recipeId),
    index("recipe_wine_pairings_wine_id_idx").on(table.wineId),
  ],
)

// ============================================
// COLLECTIONS (curated lists)
// ============================================

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    description: text("description"),
    image: varchar("image", { length: 512 }),
    published: boolean("published").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("collections_slug_idx").on(table.slug),
    index("collections_published_idx").on(table.published),
    index("collections_featured_idx").on(table.featured),
  ],
)

// ============================================
// COLLECTION RECIPES (junction with sort order)
// ============================================

export const collectionRecipes = pgTable(
  "collection_recipes",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.recipeId] }),
    index("collection_recipes_collection_id_idx").on(table.collectionId),
    index("collection_recipes_recipe_id_idx").on(table.recipeId),
    index("collection_recipes_sort_idx").on(
      table.collectionId,
      table.sortOrder,
    ),
  ],
)

// ============================================
// COLLECTION WINES (junction with sort order)
// ============================================

export const collectionWines = pgTable(
  "collection_wines",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    wineId: uuid("wine_id")
      .notNull()
      .references(() => wines.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.wineId] }),
    index("collection_wines_collection_id_idx").on(table.collectionId),
    index("collection_wines_wine_id_idx").on(table.wineId),
    index("collection_wines_sort_idx").on(table.collectionId, table.sortOrder),
  ],
)

// ============================================
// USER FAVORITES
// ============================================

export const recipeFavorites = pgTable(
  "recipe_favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.recipeId] }),
    index("recipe_favorites_user_id_idx").on(table.userId),
    index("recipe_favorites_recipe_id_idx").on(table.recipeId),
  ],
)

export const wineFavorites = pgTable(
  "wine_favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    wineId: uuid("wine_id")
      .notNull()
      .references(() => wines.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.wineId] }),
    index("wine_favorites_user_id_idx").on(table.userId),
    index("wine_favorites_wine_id_idx").on(table.wineId),
  ],
)

// ============================================
// USER RATINGS & REVIEWS
// ============================================

export const recipeRatings = pgTable(
  "recipe_ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1-5
    review: text("review"), // Optional review text
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("recipe_ratings_user_recipe_idx").on(
      table.userId,
      table.recipeId,
    ),
    index("recipe_ratings_user_id_idx").on(table.userId),
    index("recipe_ratings_recipe_id_idx").on(table.recipeId),
    index("recipe_ratings_rating_idx").on(table.rating),
  ],
)

// ============================================
// COMMENTS
// ============================================

export const recipeComments = pgTable(
  "recipe_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"), // Self-reference for replies (added via relation)
    content: text("content").notNull(),
    isActive: boolean("is_active").default(true).notNull(), // Soft delete / moderation
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("recipe_comments_recipe_id_idx").on(table.recipeId),
    index("recipe_comments_user_id_idx").on(table.userId),
    index("recipe_comments_parent_id_idx").on(table.parentId),
    index("recipe_comments_created_at_idx").on(
      table.recipeId,
      sql`${table.createdAt} DESC`,
    ),
  ],
)

export const wineComments = pgTable(
  "wine_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    wineId: uuid("wine_id")
      .notNull()
      .references(() => wines.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"), // Self-reference for replies
    content: text("content").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("wine_comments_wine_id_idx").on(table.wineId),
    index("wine_comments_user_id_idx").on(table.userId),
    index("wine_comments_parent_id_idx").on(table.parentId),
    index("wine_comments_created_at_idx").on(
      table.wineId,
      sql`${table.createdAt} DESC`,
    ),
  ],
)

// ============================================
// NEWSLETTER SUBSCRIBERS
// ============================================

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    active: boolean("active").default(true).notNull(),
    subscribedAt: timestamp("subscribed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    unsubscribeToken: varchar("unsubscribe_token", { length: 128 })
      .notNull()
      .unique()
      .default(sql`gen_random_uuid()::text`),
  },
  (table) => [
    index("subscribers_email_idx").on(table.email),
    index("subscribers_active_idx").on(table.active),
    index("subscribers_unsubscribe_token_idx").on(table.unsubscribeToken),
  ],
)

// ============================================
// EXPERIMENTS (Test Kitchen)
// ============================================

export const experiments = pgTable(
  "experiments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    slug: varchar("slug", { length: 256 }).notNull().unique(),
    description: text("description").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("in_progress"), // in_progress, paused, completed, graduated
    hypothesis: text("hypothesis"),
    result: text("result"),
    recipeId: uuid("recipe_id").references(() => recipes.id, {
      onDelete: "set null",
    }), // Set when graduated to a recipe
    image: varchar("image", { length: 512 }),
    published: boolean("published").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("experiments_slug_idx").on(table.slug),
    index("experiments_status_idx").on(table.status),
    index("experiments_published_idx").on(table.published),
    index("experiments_featured_idx").on(table.featured),
    index("experiments_created_at_idx").on(sql`${table.createdAt} DESC`),
    index("experiments_published_created_idx").on(
      table.published,
      sql`${table.createdAt} DESC`,
    ),
  ],
)

// ============================================
// EXPERIMENT ENTRIES (timeline updates)
// ============================================

export const experimentEntries = pgTable(
  "experiment_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => experiments.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    entryType: varchar("entry_type", { length: 50 })
      .notNull()
      .default("update"), // update, photo, note, result, iteration
    images: jsonb("images").$type<string[]>().default(sql`'[]'::jsonb`),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("experiment_entries_experiment_id_idx").on(table.experimentId),
    index("experiment_entries_sort_idx").on(
      table.experimentId,
      table.sortOrder,
    ),
    index("experiment_entries_created_at_idx").on(
      table.experimentId,
      sql`${table.createdAt} DESC`,
    ),
  ],
)

// ============================================
// EXPERIMENT TAGS (junction)
// ============================================

export const experimentTags = pgTable(
  "experiment_tags",
  {
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => experiments.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.experimentId, table.tagId] }),
    index("experiment_tags_experiment_id_idx").on(table.experimentId),
    index("experiment_tags_tag_id_idx").on(table.tagId),
  ],
)

// ============================================
// RELATIONS
// ============================================

export const tagsRelations = relations(tags, ({ many }) => ({
  recipeTags: many(recipeTags),
  wineTags: many(wineTags),
  experimentTags: many(experimentTags),
}))

export const recipesRelations = relations(recipes, ({ many }) => ({
  tags: many(recipeTags),
  winePairings: many(recipeWinePairings),
  favorites: many(recipeFavorites),
  ratings: many(recipeRatings),
  comments: many(recipeComments),
  collections: many(collectionRecipes),
}))

export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeTags.recipeId],
    references: [recipes.id],
  }),
  tag: one(tags, {
    fields: [recipeTags.tagId],
    references: [tags.id],
  }),
}))

export const winesRelations = relations(wines, ({ many }) => ({
  tags: many(wineTags),
  recipePairings: many(recipeWinePairings),
  favorites: many(wineFavorites),
  comments: many(wineComments),
  collections: many(collectionWines),
}))

export const wineTagsRelations = relations(wineTags, ({ one }) => ({
  wine: one(wines, {
    fields: [wineTags.wineId],
    references: [wines.id],
  }),
  tag: one(tags, {
    fields: [wineTags.tagId],
    references: [tags.id],
  }),
}))

export const recipeWinePairingsRelations = relations(
  recipeWinePairings,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeWinePairings.recipeId],
      references: [recipes.id],
    }),
    wine: one(wines, {
      fields: [recipeWinePairings.wineId],
      references: [wines.id],
    }),
  }),
)

export const collectionsRelations = relations(collections, ({ many }) => ({
  recipes: many(collectionRecipes),
  wines: many(collectionWines),
}))

export const collectionRecipesRelations = relations(
  collectionRecipes,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionRecipes.collectionId],
      references: [collections.id],
    }),
    recipe: one(recipes, {
      fields: [collectionRecipes.recipeId],
      references: [recipes.id],
    }),
  }),
)

export const collectionWinesRelations = relations(
  collectionWines,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionWines.collectionId],
      references: [collections.id],
    }),
    wine: one(wines, {
      fields: [collectionWines.wineId],
      references: [wines.id],
    }),
  }),
)

export const recipeFavoritesRelations = relations(
  recipeFavorites,
  ({ one }) => ({
    user: one(user, {
      fields: [recipeFavorites.userId],
      references: [user.id],
    }),
    recipe: one(recipes, {
      fields: [recipeFavorites.recipeId],
      references: [recipes.id],
    }),
  }),
)

export const wineFavoritesRelations = relations(wineFavorites, ({ one }) => ({
  user: one(user, {
    fields: [wineFavorites.userId],
    references: [user.id],
  }),
  wine: one(wines, {
    fields: [wineFavorites.wineId],
    references: [wines.id],
  }),
}))

export const recipeRatingsRelations = relations(recipeRatings, ({ one }) => ({
  user: one(user, {
    fields: [recipeRatings.userId],
    references: [user.id],
  }),
  recipe: one(recipes, {
    fields: [recipeRatings.recipeId],
    references: [recipes.id],
  }),
}))

export const recipeCommentsRelations = relations(
  recipeComments,
  ({ one, many }) => ({
    recipe: one(recipes, {
      fields: [recipeComments.recipeId],
      references: [recipes.id],
    }),
    user: one(user, {
      fields: [recipeComments.userId],
      references: [user.id],
    }),
    parent: one(recipeComments, {
      fields: [recipeComments.parentId],
      references: [recipeComments.id],
      relationName: "parent",
    }),
    replies: many(recipeComments, {
      relationName: "parent",
    }),
  }),
)

export const wineCommentsRelations = relations(
  wineComments,
  ({ one, many }) => ({
    wine: one(wines, {
      fields: [wineComments.wineId],
      references: [wines.id],
    }),
    user: one(user, {
      fields: [wineComments.userId],
      references: [user.id],
    }),
    parent: one(wineComments, {
      fields: [wineComments.parentId],
      references: [wineComments.id],
      relationName: "parent",
    }),
    replies: many(wineComments, {
      relationName: "parent",
    }),
  }),
)

export const experimentsRelations = relations(experiments, ({ one, many }) => ({
  recipe: one(recipes, {
    fields: [experiments.recipeId],
    references: [recipes.id],
  }),
  entries: many(experimentEntries),
  tags: many(experimentTags),
}))

export const experimentEntriesRelations = relations(
  experimentEntries,
  ({ one }) => ({
    experiment: one(experiments, {
      fields: [experimentEntries.experimentId],
      references: [experiments.id],
    }),
  }),
)

export const experimentTagsRelations = relations(experimentTags, ({ one }) => ({
  experiment: one(experiments, {
    fields: [experimentTags.experimentId],
    references: [experiments.id],
  }),
  tag: one(tags, {
    fields: [experimentTags.tagId],
    references: [tags.id],
  }),
}))

export const subscribersRelations = relations(subscribers, () => ({}))

// ============================================
// ZOD VALIDATION SCHEMAS
// ============================================

export const createTagSchema = createInsertSchema(tags, {
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  type: z.enum(tagTypeEnum),
}).omit({
  id: true,
  createdAt: true,
})

export const createRecipeSchema = createInsertSchema(recipes, {
  title: z.string().min(1).max(256),
  slug: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  category: z.string().min(1).max(100),
  difficulty: z.enum(difficultyEnum),
  prepTime: z.number().int().positive().optional(),
  cookTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  ingredients: z.array(
    z.object({
      group: z.string().optional(),
      items: z.array(z.string()),
    }),
  ),
  instructions: z.array(
    z.object({
      step: z.number().int().positive(),
      text: z.string(),
    }),
  ),
  tips: z.array(z.string()).optional(),
  image: z.string().max(512).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
}).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
})

export const updateRecipeSchema = createRecipeSchema.partial()

export const createWineSchema = createInsertSchema(wines, {
  name: z.string().min(1).max(256),
  slug: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[a-z0-9-]+$/),
  winery: z.string().min(1).max(256),
  region: z.string().max(256).optional(),
  country: z.string().max(100).optional(),
  vintage: z.number().int().positive().optional(),
  type: z.enum(wineTypeEnum),
  grapes: z.string().max(256).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  aromas: z.array(z.string()).optional(),
  pairings: z.array(z.string()).optional(),
  priceRange: z.enum(priceRangeEnum).optional(),
  occasion: z.string().max(100).optional(),
  image: z.string().max(512).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateWineSchema = createWineSchema.partial()

export const createCollectionSchema = createInsertSchema(collections, {
  name: z.string().min(1).max(256),
  slug: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  image: z.string().max(512).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateCollectionSchema = createCollectionSchema.partial()

export const createRecipeCommentSchema = createInsertSchema(recipeComments, {
  content: z.string().min(1).max(2000),
  recipeId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
}).omit({
  id: true,
  userId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
})

export const createWineCommentSchema = createInsertSchema(wineComments, {
  content: z.string().min(1).max(2000),
  wineId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
}).omit({
  id: true,
  userId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
})

export const createRecipeRatingSchema = createInsertSchema(recipeRatings, {
  recipeId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export const createSubscriberSchema = createInsertSchema(subscribers, {
  email: z.string().email().max(255),
}).omit({
  id: true,
  active: true,
  subscribedAt: true,
  unsubscribedAt: true,
  unsubscribeToken: true,
})

export const createRecipeWinePairingSchema = createInsertSchema(
  recipeWinePairings,
  {
    recipeId: z.string().uuid(),
    wineId: z.string().uuid(),
    notes: z.string().max(500).optional(),
    isPrimary: z.boolean().optional(),
  },
).omit({
  id: true,
  createdAt: true,
})

export const createExperimentSchema = createInsertSchema(experiments, {
  title: z.string().min(1).max(256),
  slug: z
    .string()
    .min(1)
    .max(256)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  status: z.enum(experimentStatusEnum).optional(),
  hypothesis: z.string().optional(),
  result: z.string().optional(),
  recipeId: z.string().uuid().optional().nullable(),
  image: z.string().max(512).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateExperimentSchema = createExperimentSchema.partial()

export const createExperimentEntrySchema = createInsertSchema(
  experimentEntries,
  {
    experimentId: z.string().uuid(),
    content: z.string().min(1).max(5000),
    entryType: z.enum(experimentEntryTypeEnum).optional(),
    images: z.array(z.string().max(512)).optional(),
    sortOrder: z.number().int().min(0).optional(),
  },
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const updateExperimentEntrySchema = createExperimentEntrySchema
  .partial()
  .omit({ experimentId: true })

// ============================================
// TYPES
// ============================================

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert

export type Wine = typeof wines.$inferSelect
export type NewWine = typeof wines.$inferInsert

export type Collection = typeof collections.$inferSelect
export type NewCollection = typeof collections.$inferInsert

export type RecipeWinePairing = typeof recipeWinePairings.$inferSelect
export type NewRecipeWinePairing = typeof recipeWinePairings.$inferInsert

export type RecipeFavorite = typeof recipeFavorites.$inferSelect
export type NewRecipeFavorite = typeof recipeFavorites.$inferInsert

export type WineFavorite = typeof wineFavorites.$inferSelect
export type NewWineFavorite = typeof wineFavorites.$inferInsert

export type RecipeRating = typeof recipeRatings.$inferSelect
export type NewRecipeRating = typeof recipeRatings.$inferInsert

export type RecipeComment = typeof recipeComments.$inferSelect
export type NewRecipeComment = typeof recipeComments.$inferInsert

export type WineComment = typeof wineComments.$inferSelect
export type NewWineComment = typeof wineComments.$inferInsert

export type Subscriber = typeof subscribers.$inferSelect
export type NewSubscriber = typeof subscribers.$inferInsert

export type Experiment = typeof experiments.$inferSelect
export type NewExperiment = typeof experiments.$inferInsert

export type ExperimentEntry = typeof experimentEntries.$inferSelect
export type NewExperimentEntry = typeof experimentEntries.$inferInsert

// Re-export auth schema
export * from "./auth-schema"
