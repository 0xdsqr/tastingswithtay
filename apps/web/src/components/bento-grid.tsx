import { Link } from "@tanstack/react-router"
import type { Recipe } from "@twt/database/schema"
import { Eyebrow, SectionHeader } from "@twt/react/components/section-header"
import { ArrowRight, Clock, CookingPot, Flower2, Users, Wine } from "lucide-react"
import type React from "react"
import type { HomeContent } from "../lib/site-content"
import { formatTime } from "../lib/format"
import { GhostCard } from "./empty-state"
import { NewsletterSignupForm } from "./newsletter-signup-form"
import { OptimizedImage } from "./optimized-image"
import { SocialSommBentoCard } from "./social-somm-callout"

interface BentoItemProps {
  children: React.ReactNode
  className?: string
}

function BentoItem({ children, className = "" }: BentoItemProps): React.ReactElement {
  return <div className={className}>{children}</div>
}

interface BentoGridProps {
  recipes: Recipe[]
  categories: string[]
  content: HomeContent
}

export function BentoGrid({ recipes, categories, content }: BentoGridProps): React.ReactElement {
  // Lead with a single featured recipe so the supporting cards stay calm and intentional.
  const featuredRecipe = recipes[0]
  const hasRecipes = recipes.length > 0
  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <BentoItem className="mb-12">
          <SectionHeader
            align="center"
            eyebrow={content.bentoEyebrow}
            title={content.bentoTitle}
            titleClassName="lg:text-5xl"
          />
        </BentoItem>

        {/* Bento Grid */}
        <div className="grid auto-rows-[200px] grid-cols-2 gap-4 lg:auto-rows-[240px] lg:grid-cols-4 lg:gap-6">
          {/* Recipe cells: real content or ghost placeholders */}
          {hasRecipes ? (
            <>
              {/* Large Featured Recipe */}
              {featuredRecipe && (
                <BentoItem className="col-span-2 row-span-2">
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
                          {(featuredRecipe.prepTime || featuredRecipe.cookTime) && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(
                                (featuredRecipe.prepTime ?? 0) + (featuredRecipe.cookTime ?? 0),
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
            </>
          ) : (
            <>
              {/* Ghost placeholder for featured recipe (2x2) */}
              <BentoItem className="col-span-2 row-span-2">
                <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="h-full w-full bg-muted opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <CookingPot className="size-6 text-muted-foreground" />
                    </div>
                    <p className="font-serif text-xl text-foreground">Recipes coming soon</p>
                    <p className="text-sm text-muted-foreground">
                      Tay is cooking up something special
                    </p>
                  </div>
                </div>
              </BentoItem>

              {/* Ghost placeholder small cards */}
              <BentoItem>
                <GhostCard aspectRatio="aspect-auto" className="h-full opacity-60" />
              </BentoItem>
              <BentoItem>
                <GhostCard aspectRatio="aspect-auto" className="h-full opacity-60" />
              </BentoItem>
            </>
          )}

          {/* Wine Club Highlight */}
          <BentoItem className="col-span-2">
            <SocialSommBentoCard />
          </BentoItem>

          {/* Wine Cellar Card */}
          <BentoItem>
            <Link to="/wine" search={{ type: undefined }} className="group block h-full">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-brand-burgundy p-6">
                <div>
                  <Wine className="mb-3 h-8 w-8 text-brand-gold" />
                  <Eyebrow className="mb-2 text-xs text-brand-gold/80">Tastings</Eyebrow>
                  <h3 className="font-serif text-2xl text-brand-cream transition-colors group-hover:text-brand-gold">
                    Wine Cellar
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-cream/70">
                    Tasting notes, pairings, and favorite discoveries.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-brand-gold transition-colors group-hover:text-brand-cream">
                  <span>Explore wines</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </BentoItem>

          {/* Meet Tay Card */}
          <BentoItem>
            <Link to="/about" className="group block h-full">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-primary/10 p-6">
                <div>
                  <Eyebrow className="mb-2 text-xs text-primary">The Chef</Eyebrow>
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

          {/* Garden & Flock Preview */}
          <BentoItem className="col-span-2 lg:col-span-1">
            <Link
              to="/garden-and-flock"
              search={{ category: undefined }}
              className="group block h-full"
            >
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6">
                <div>
                  <Flower2 className="mb-3 h-8 w-8 text-primary" />
                  <h3 className="font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                    Garden &amp; Flock
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Seasonal life outside the kitchen
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-primary">
                  <span>Explore</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </BentoItem>

          {/* Categories Row */}
          <BentoItem className="col-span-2 lg:col-span-3">
            <div className="h-full overflow-hidden rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl text-foreground">Browse Categories</h3>
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
                  <div className="flex gap-3 opacity-60">
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
          <BentoItem className="col-span-2 lg:col-span-4">
            <div className="flex h-full flex-col justify-center overflow-hidden rounded-2xl bg-brand-burgundy p-6 text-brand-cream">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="mb-1 font-serif text-2xl">Get Tay&apos;s Top 10 Recipes</h3>
                  <p className="text-sm text-brand-cream/80">
                    Join the community and receive a free recipe eBook.
                  </p>
                </div>
                <NewsletterSignupForm appearance="card" />
              </div>
            </div>
          </BentoItem>
        </div>
      </div>
    </section>
  )
}
