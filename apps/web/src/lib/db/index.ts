import { Database } from "bun:sqlite"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const DB_PATH = join(process.cwd(), "data", "tastingswithtay.db")

let db: Database | null = null

export function getDb(): Database {
  if (!db) {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), "data")
    try {
      Bun.spawnSync(["mkdir", "-p", dataDir])
    } catch {
      // Directory might already exist
    }

    db = new Database(DB_PATH, { create: true })
    db.exec("PRAGMA journal_mode = WAL;")
    db.exec("PRAGMA foreign_keys = ON;")

    // Initialize schema
    const schemaPath = join(import.meta.dir, "schema.sql")
    const schema = readFileSync(schemaPath, "utf-8")
    db.exec(schema)
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

export * from "./types"
