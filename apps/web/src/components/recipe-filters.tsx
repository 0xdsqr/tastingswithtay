import { Link } from "@tanstack/react-router"

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
      <Link
        to="/recipes"
        search={{ category: undefined }}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !activeCategory
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          to="/recipes"
          search={{ category }}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === category
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {category}
        </Link>
      ))}
    </div>
  )
}
