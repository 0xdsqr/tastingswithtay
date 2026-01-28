"use client"

interface RecipeFiltersProps {
  categories: string[]
  activeCategory?: string
}

export function RecipeFilters({
  categories,
  activeCategory,
}: RecipeFiltersProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/recipes"
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !activeCategory
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        All
      </a>
      {categories.map((category) => (
        <a
          key={category}
          href={`/recipes?category=${category.toLowerCase()}`}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory?.toLowerCase() === category.toLowerCase()
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {category}
        </a>
      ))}
    </div>
  )
}
