// Database types for Tastings with Tay

export type Difficulty = "Easy" | "Medium" | "Hard"
export type WineType = "Red" | "White" | "Rosé" | "Sparkling" | "Dessert"

export interface IngredientGroup {
  group?: string
  items: string[]
}

export interface Instruction {
  step: number
  text: string
}

export interface Recipe {
  id: string
  slug: string
  title: string
  description: string
  image: string
  category: string
  time: string
  prepTime: string
  cookTime: string
  servings: number
  difficulty: Difficulty
  ingredients: IngredientGroup[]
  instructions: Instruction[]
  tips?: string[]
  tags: string[]
  featured: boolean
  createdAt: string
}

export interface Wine {
  id: string
  name: string
  winery: string
  region: string
  country: string
  year: number
  type: WineType
  grape: string
  rating: number
  notes: string
  aromas: string[]
  pairings: string[]
  image: string
  price?: string
  occasion?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  longDescription?: string
  price: number
  compareAtPrice?: number
  image: string
  images?: string[]
  category: string
  tags: string[]
  inStock: boolean
  featured: boolean
  details?: string[]
}

// Database row types (snake_case with JSON strings)
export interface RecipeRow {
  id: string
  slug: string
  title: string
  description: string
  image: string
  category: string
  time: string
  prep_time: string
  cook_time: string
  servings: number
  difficulty: Difficulty
  ingredients: string // JSON
  instructions: string // JSON
  tips: string | null // JSON
  tags: string // JSON
  featured: number // 0 or 1
  created_at: string
}

export interface WineRow {
  id: string
  name: string
  winery: string
  region: string
  country: string
  year: number
  type: WineType
  grape: string
  rating: number
  notes: string
  aromas: string // JSON
  pairings: string // JSON
  image: string
  price: string | null
  occasion: string | null
}

export interface ProductRow {
  id: string
  slug: string
  name: string
  description: string
  long_description: string | null
  price: number
  compare_at_price: number | null
  image: string
  images: string | null // JSON
  category: string
  tags: string // JSON
  in_stock: number // 0 or 1
  featured: number // 0 or 1
  details: string | null // JSON
}
