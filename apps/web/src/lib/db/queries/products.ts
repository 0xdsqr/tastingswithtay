import { getDb } from "../index"
import type { Product, ProductRow } from "../types"

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.long_description ?? undefined,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    image: row.image,
    images: row.images ? (JSON.parse(row.images) as string[]) : undefined,
    category: row.category,
    tags: JSON.parse(row.tags) as string[],
    inStock: row.in_stock === 1,
    featured: row.featured === 1,
    details: row.details ? (JSON.parse(row.details) as string[]) : undefined,
  }
}

export function getAllProducts(): Product[] {
  const db = getDb()
  const rows = db.query<ProductRow, []>("SELECT * FROM products").all()
  return rows.map(rowToProduct)
}

export function getProductBySlug(slug: string): Product | undefined {
  const db = getDb()
  const row = db
    .query<ProductRow, [string]>("SELECT * FROM products WHERE slug = ?")
    .get(slug)
  return row ? rowToProduct(row) : undefined
}

export function getProductsByCategory(category: string): Product[] {
  const db = getDb()
  const rows = db
    .query<ProductRow, [string]>(
      "SELECT * FROM products WHERE LOWER(category) = LOWER(?)",
    )
    .all(category)
  return rows.map(rowToProduct)
}

export function getFeaturedProducts(): Product[] {
  const db = getDb()
  const rows = db
    .query<ProductRow, []>("SELECT * FROM products WHERE featured = 1")
    .all()
  return rows.map(rowToProduct)
}

export function getAllProductCategories(): string[] {
  const db = getDb()
  const rows = db
    .query<{ category: string }, []>("SELECT DISTINCT category FROM products")
    .all()
  return rows.map((r) => r.category)
}
