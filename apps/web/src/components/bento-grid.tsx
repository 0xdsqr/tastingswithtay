import { Link } from "@tanstack/react-router"
import type { Recipe } from "@twt/db/schema"
import { Button } from "@twt/ui/components/button"
import {
  ArrowRight,
  Clock,
  CookingPot,
  ShoppingBag,
  Users,
  Wine,
} from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { GhostCard } from "./empty-state"
import { OptimizedImage } from "./optimized-image"

function formatTime(minutes: number | null): string {
  if (!minutes) return ""
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`
}

interface BentoItemProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

function BentoItem({
  children,
  className = "",
  delay = 0,
}: BentoItemProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface BentoGridProps {
  recipes: Recipe[]
  categories: string[]
}

export function BentoGrid({
  recipes,
  categories,
}: BentoGridProps): React.ReactElement {
  // Get first 3 featured recipes for display
  const featuredRecipe = recipes[0]
  const secondRecipe = recipes[1]
  const thirdRecipe = recipes[2]
  const hasRecipes = recipes.length > 0
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <BentoItem className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Discover
          </p>
          <h2 className="text-balance font-serif text-3xl tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            What&apos;s Cooking
          </h2>
        </BentoItem>

        {/* Bento Grid */}
        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 lg:auto-rows-[240px] lg:grid-cols-4 lg:gap-6">
          {/* Recipe cells: real content or ghost placeholders */}
          {hasRecipes ? (
            <>
              {/* Large Featured Recipe */}
              {featuredRecipe && (
                <BentoItem className="col-span-2 row-span-2" delay={100}>
                  <Link
                    to="/recipes/$slug"
                    params={{ slug: featuredRecipe.slug }}
                    className="group block h-full"
                  >
                    <div className="relative h-full overflow-hidden rounded-2xl bg-card">
                      {featuredRecipe.image && (
                        <OptimizedImage
                          src={featuredRecipe.image}
                          alt={featuredRecipe.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                        <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground">
                          Featured
                        </span>
                        <h3 className="mb-2 font-serif text-2xl text-foreground transition-colors group-hover:text-primary lg:text-3xl">
                          {featuredRecipe.title}
                        </h3>
                        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                          {featuredRecipe.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {(featuredRecipe.prepTime ||
                            featuredRecipe.cookTime) && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(
                                (featuredRecipe.prepTime ?? 0) +
                                  (featuredRecipe.cookTime ?? 0),
                              )}
                            </span>
                          )}
                          {featuredRecipe.servings && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {featuredRecipe.servings} servings
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </BentoItem>
              )}

              {/* Quick Recipe 2 */}
              {secondRecipe && (
                <BentoItem delay={200}>
                  <Link
                    to="/recipes/$slug"
                    params={{ slug: secondRecipe.slug }}
                    className="group block h-full"
                  >
                    <div className="relative h-full overflow-hidden rounded-2xl bg-card">
                      {secondRecipe.image && (
                        <OptimizedImage
                          src={secondRecipe.image}
                          alt={secondRecipe.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="line-clamp-1 font-serif text-lg text-foreground transition-colors group-hover:text-primary">
                          {secondRecipe.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(
                            (secondRecipe.prepTime ?? 0) +
                              (secondRecipe.cookTime ?? 0),
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </BentoItem>
              )}

              {/* Quick Recipe 3 */}
              {thirdRecipe && (
                <BentoItem delay={250}>
                  <Link
                    to="/recipes/$slug"
                    params={{ slug: thirdRecipe.slug }}
                    className="group block h-full"
                  >
                    <div className="relative h-full overflow-hidden rounded-2xl bg-card">
                      {thirdRecipe.image && (
                        <OptimizedImage
                          src={thirdRecipe.image}
                          alt={thirdRecipe.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="line-clamp-1 font-serif text-lg text-foreground transition-colors group-hover:text-primary">
                          {thirdRecipe.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(
                            (thirdRecipe.prepTime ?? 0) +
                              (thirdRecipe.cookTime ?? 0),
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                </BentoItem>
              )}
            </>
          ) : (
            <>
              {/* Ghost placeholder for featured recipe (2x2) */}
              <BentoItem className="col-span-2 row-span-2" delay={100}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="h-full w-full bg-muted opacity-40 blur-[2px]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <CookingPot className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-serif text-xl text-foreground">
                      Recipes coming soon
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tay is cooking up something special
                    </p>
                  </div>
                </div>
              </BentoItem>

              {/* Ghost placeholder small cards */}
              <BentoItem delay={200}>
                <GhostCard
                  aspectRatio="aspect-auto"
                  className="h-full opacity-40 blur-[1px]"
                />
              </BentoItem>
              <BentoItem delay={250}>
                <GhostCard
                  aspectRatio="aspect-auto"
                  className="h-full opacity-40 blur-[1px]"
                />
              </BentoItem>
            </>
          )}

          {/* Wine Cellar Card */}
          <BentoItem className="row-span-2" delay={300}>
            <Link
              to="/wine"
              search={{ type: undefined }}
              className="group block h-full"
            >
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#2D1B2E] to-[#1A1014] p-6">
                <div>
                  <Wine className="mb-3 h-8 w-8 text-[#C4A77D]" />
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#C4A77D]/80">
                    Tastings
                  </p>
                  <h3 className="font-serif text-2xl text-[#FAF7F2] transition-colors group-hover:text-[#C4A77D]">
                    Wine Cellar
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#FAF7F2]/70">
                    Tasting notes, pairings, and my favorite discoveries from
                    vineyards near and far.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#C4A77D] transition-colors group-hover:text-[#FAF7F2]">
                  <span>Explore wines</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </BentoItem>

          {/* Meet Tay Card */}
          <BentoItem delay={350}>
            <Link to="/about" className="group block h-full">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-primary/10 p-6">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
                    The Chef
                  </p>
                  <h3 className="font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                    Meet Tay
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </BentoItem>

          {/* Shop Preview */}
          <BentoItem delay={400}>
            <Link to="/shop" className="group block h-full">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6">
                <div>
                  <ShoppingBag className="mb-3 h-8 w-8 text-primary" />
                  <h3 className="font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                    Shop
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Curated kitchen essentials
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                  <span>Browse</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </BentoItem>

          {/* Categories Row */}
          <BentoItem className="col-span-2" delay={450}>
            <div className="h-full overflow-hidden rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl text-foreground">
                  Browse Categories
                </h3>
                <Link
                  to="/recipes"
                  search={{ category: undefined }}
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat}
                      to="/recipes"
                      search={{ category: cat }}
                      className="flex-shrink-0 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {cat}
                    </Link>
                  ))
                ) : (
                  <div className="flex gap-3 opacity-40 blur-[1px]">
                    {["Dinner", "Dessert", "Brunch", "Salads"].map((cat) => (
                      <span
                        key={cat}
                        className="flex-shrink-0 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </BentoItem>

          {/* Newsletter Card */}
          <BentoItem className="col-span-2" delay={500}>
            <div className="flex h-full flex-col justify-center overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="mb-1 font-serif text-2xl">
                    Get Tay&apos;s Top 10 Recipes
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    Join the community and receive a free recipe eBook.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 lg:w-auto"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </BentoItem>
        </div>
      </div>
    </section>
  )
}
