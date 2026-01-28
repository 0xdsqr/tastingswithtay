import { Clock, Users } from "lucide-react"
import type { Recipe } from "../lib/db/types"

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps): React.ReactElement {
  return (
    <a href={`/recipes/${recipe.slug}`} className="group block">
      <article className="flex h-full flex-col">
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-medium tracking-wide text-foreground backdrop-blur-sm">
              {recipe.category}
            </span>
            {recipe.featured && (
              <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground">
                Featured
              </span>
            )}
          </div>
          <div className="absolute bottom-4 right-4">
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${
                recipe.difficulty === "Easy"
                  ? "bg-green-100 text-green-800"
                  : recipe.difficulty === "Medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <h3 className="mb-2 font-serif text-xl text-foreground transition-colors group-hover:text-primary">
            {recipe.title}
          </h3>
          <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {recipe.time}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {recipe.servings} servings
            </span>
          </div>
        </div>
      </article>
    </a>
  )
}
