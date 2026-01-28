import type { Recipe } from "@twt/db/schema"
import { ArrowRight, Clock, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface LatestRecipesProps {
  recipes: Recipe[]
}

export function LatestRecipes({
  recipes,
}: LatestRecipesProps): React.ReactElement | null {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  // Take only first 3 recipes
  const displayRecipes = recipes.slice(0, 3)

  if (displayRecipes.length === 0) return null

  return (
    <section ref={ref} className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`mb-12 flex flex-col gap-4 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              From the Kitchen
            </p>
            <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
              Latest Recipes
            </h2>
          </div>
          <a
            href="/recipes"
            className="group inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            View all recipes
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Recipes Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {displayRecipes.map((recipe, index) => {
            const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)
            const timeDisplay =
              totalTime > 60
                ? `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`
                : `${totalTime} min`

            return (
              <a
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                className={`group transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{
                  transitionDelay: isVisible ? `${(index + 1) * 100}ms` : "0ms",
                }}
              >
                <article className="flex h-full flex-col">
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute left-4 top-4">
                      <span className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-medium tracking-wide text-foreground backdrop-blur-sm">
                        {recipe.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="text-balance mb-2 font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                      {recipe.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {totalTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {timeDisplay}
                        </span>
                      )}
                      {recipe.servings && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {recipe.servings} servings
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
