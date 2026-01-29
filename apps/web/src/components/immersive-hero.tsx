import { Link } from "@tanstack/react-router"
import type { Recipe } from "@twt/db/schema"
import { Button } from "@twt/ui/components/button"
import { ArrowDown, Clock, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { OptimizedImage } from "./optimized-image"

function formatTime(minutes: number | null): string {
  if (!minutes) return ""
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`
}

interface ImmersiveHeroProps {
  recipes: Recipe[]
}

export function ImmersiveHero({
  recipes,
}: ImmersiveHeroProps): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // Use first 3 recipes for hero carousel
  const heroRecipes = recipes.slice(0, 3)

  useEffect(() => {
    setIsVisible(true)
    if (heroRecipes.length === 0) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroRecipes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroRecipes.length])

  const activeRecipe = heroRecipes[activeIndex] ?? heroRecipes[0]
  const totalTime = activeRecipe
    ? (activeRecipe.prepTime ?? 0) + (activeRecipe.cookTime ?? 0)
    : 0

  // Fallback if no recipes
  if (!activeRecipe) {
    return (
      <section className="relative flex min-h-[100svh] items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-5xl text-foreground">
            Tastings with Tay
          </h1>
          <p className="mt-4 text-muted-foreground">Recipes coming soon...</p>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Background Images with Crossfade */}
      {heroRecipes.map((recipe, index) => (
        <div
          key={recipe.slug}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {recipe.image && (
            <OptimizedImage
              src={recipe.image}
              alt={recipe.title}
              priority={index === 0}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p
            className={`mb-4 text-sm font-medium uppercase tracking-widest text-primary transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Tastings with Tay
          </p>

          <h1
            className={`mb-4 font-serif text-5xl leading-[1.1] tracking-tight text-foreground transition-all delay-100 duration-700 sm:text-6xl lg:text-7xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <span className="block">{activeRecipe.title}</span>
            <span className="mt-2 block font-serif text-3xl italic text-muted-foreground sm:text-4xl lg:text-5xl">
              {activeRecipe.category}
            </span>
          </h1>

          <div
            className={`mb-8 flex items-center gap-6 text-sm text-muted-foreground transition-all delay-200 duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            {totalTime > 0 && (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatTime(totalTime)}
              </span>
            )}
            {activeRecipe.servings && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {activeRecipe.servings} servings
              </span>
            )}
          </div>

          <div
            className={`mb-12 flex flex-col gap-4 transition-all delay-300 duration-700 sm:flex-row ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <Button size="lg" asChild>
              <Link to="/recipes/$slug" params={{ slug: activeRecipe.slug }}>
                View Recipe
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-background/50 backdrop-blur-sm"
              asChild
            >
              <Link to="/recipes" search={{ category: undefined }}>
                Browse All Recipes
              </Link>
            </Button>
          </div>

          {/* Recipe Indicators */}
          <div
            className={`flex gap-3 transition-all delay-400 duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            {heroRecipes.map((recipe, index) => (
              <button
                key={recipe.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group flex items-center gap-3 transition-all duration-300 ${
                  index === activeIndex
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-75"
                }`}
              >
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === activeIndex
                      ? "w-12 bg-primary"
                      : "w-6 bg-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  )
}
