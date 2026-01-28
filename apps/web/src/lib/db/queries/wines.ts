import { getDb } from "../index"
import type { Wine, WineRow } from "../types"

function rowToWine(row: WineRow): Wine {
  return {
    id: row.id,
    name: row.name,
    winery: row.winery,
    region: row.region,
    country: row.country,
    year: row.year,
    type: row.type,
    grape: row.grape,
    rating: row.rating,
    notes: row.notes,
    aromas: JSON.parse(row.aromas) as string[],
    pairings: JSON.parse(row.pairings) as string[],
    image: row.image,
    price: row.price ?? undefined,
    occasion: row.occasion ?? undefined,
  }
}

export function getAllWines(): Wine[] {
  const db = getDb()
  const rows = db
    .query<WineRow, []>("SELECT * FROM wines ORDER BY year DESC")
    .all()
  return rows.map(rowToWine)
}

export function getWineById(id: string): Wine | undefined {
  const db = getDb()
  const row = db
    .query<WineRow, [string]>("SELECT * FROM wines WHERE id = ?")
    .get(id)
  return row ? rowToWine(row) : undefined
}

export function getWinesByType(type: string): Wine[] {
  const db = getDb()
  if (type === "All") {
    return getAllWines()
  }
  const rows = db
    .query<WineRow, [string]>(
      "SELECT * FROM wines WHERE type = ? ORDER BY year DESC",
    )
    .all(type)
  return rows.map(rowToWine)
}

export const wineTypes = [
  "All",
  "Red",
  "White",
  "Rosé",
  "Sparkling",
  "Dessert",
] as const
