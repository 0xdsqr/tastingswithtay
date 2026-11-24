/**
 * Allowed values for enumerated text columns. Pure constants with no driver
 * imports, so browser code can share them with the schema.
 */
export const difficultyEnum = ["Easy", "Medium", "Hard"] as const
export const wineTypeEnum = ["Red", "White", "Rosé", "Sparkling", "Dessert"] as const
export const priceRangeEnum = ["$", "$$", "$$$", "$$$$", "$$$$$"] as const
export const tagTypeEnum = ["recipe", "wine", "experiment", "both"] as const
export const experimentStatusEnum = ["in_progress", "paused", "completed", "graduated"] as const
export const experimentEntryTypeEnum = ["update", "photo", "note", "result", "iteration"] as const
export const galleryCategoryEnum = ["garden", "flock"] as const
