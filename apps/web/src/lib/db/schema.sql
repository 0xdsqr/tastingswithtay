-- Tastings with Tay Database Schema
-- Using SQLite with Bun native driver

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL,
  time TEXT NOT NULL,
  prep_time TEXT NOT NULL,
  cook_time TEXT NOT NULL,
  servings INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ingredients TEXT NOT NULL, -- JSON array
  instructions TEXT NOT NULL, -- JSON array
  tips TEXT, -- JSON array (nullable)
  tags TEXT NOT NULL, -- JSON array
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Wines table
CREATE TABLE IF NOT EXISTS wines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  winery TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Red', 'White', 'Rosé', 'Sparkling', 'Dessert')),
  grape TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  notes TEXT NOT NULL,
  aromas TEXT NOT NULL, -- JSON array
  pairings TEXT NOT NULL, -- JSON array
  image TEXT NOT NULL,
  price TEXT,
  occasion TEXT
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price INTEGER NOT NULL, -- Store in cents for precision
  compare_at_price INTEGER,
  image TEXT NOT NULL,
  images TEXT, -- JSON array
  category TEXT NOT NULL,
  tags TEXT NOT NULL, -- JSON array
  in_stock INTEGER NOT NULL DEFAULT 1,
  featured INTEGER NOT NULL DEFAULT 0,
  details TEXT -- JSON array
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_featured ON recipes(featured);
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes(slug);

CREATE INDEX IF NOT EXISTS idx_wines_type ON wines(type);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
