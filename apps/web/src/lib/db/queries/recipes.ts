import { getDb } from "../index"
import type { IngredientGroup, Instruction, Recipe, RecipeRow } from "../types"

function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    image: row.image,
    category: row.category,
    time: row.time,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    difficulty: row.difficulty,
    ingredients: JSON.parse(row.ingredients) as IngredientGroup[],
    instructions: JSON.parse(row.instructions) as Instruction[],
    tips: row.tips ? (JSON.parse(row.tips) as string[]) : undefined,
    tags: JSON.parse(row.tags) as string[],
    featured: row.featured === 1,
    createdAt: row.created_at,
  }
}

export function getAllRecipes(): Recipe[] {
  const db = getDb()
  const rows = db
    .query<RecipeRow, []>("SELECT * FROM recipes ORDER BY created_at DESC")
    .all()
  return rows.map(rowToRecipe)
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  const db = getDb()
  const row = db
    .query<RecipeRow, [string]>("SELECT * FROM recipes WHERE slug = ?")
    .get(slug)
  return row ? rowToRecipe(row) : undefined
}

export function getRecipesByCategory(category: string): Recipe[] {
  const db = getDb()
  const rows = db
    .query<RecipeRow, [string]>(
      "SELECT * FROM recipes WHERE LOWER(category) = LOWER(?) ORDER BY created_at DESC",
    )
    .all(category)
  return rows.map(rowToRecipe)
}

export function getFeaturedRecipes(): Recipe[] {
  const db = getDb()
  const rows = db
    .query<RecipeRow, []>(
      "SELECT * FROM recipes WHERE featured = 1 ORDER BY created_at DESC",
    )
    .all()
  return rows.map(rowToRecipe)
}

export function getAllCategories(): string[] {
  const db = getDb()
  const rows = db
    .query<{ category: string }, []>("SELECT DISTINCT category FROM recipes")
    .all()
  return rows.map((r) => r.category)
}
