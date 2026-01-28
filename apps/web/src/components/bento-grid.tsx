"use client"

import { Button } from "@twt/ui/components/button"
import { ArrowRight, Clock, ShoppingBag, Users, Wine } from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"

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

export function BentoGrid(): React.ReactElement {
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
          {/* Large Featured Recipe */}
          <BentoItem className="col-span-2 row-span-2" delay={100}>
            <a
              href="/recipes/honey-glazed-salmon"
              className="group block h-full"
            >
              <div className="relative h-full overflow-hidden rounded-2xl bg-card">
                <img
                  src="/honey-glazed-salmon-with-colorful-roasted-vegetabl.jpg"
                  alt="Honey Glazed Salmon"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <span className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground">
                    Featured
                  </span>
                  <h3 className="mb-2 font-serif text-2xl text-foreground transition-colors group-hover:text-primary lg:text-3xl">
                    Honey Glazed Salmon
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    A perfectly balanced weeknight dinner that feels special.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      35 min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />4 servings
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </BentoItem>

          {/* Quick Recipe 1 */}
          <BentoItem delay={200}>
            <a
              href="/recipes/rustic-sourdough-bread"
              className="group block h-full"
            >
              <div className="relative h-full overflow-hidden rounded-2xl bg-card">
                <img
                  src="/artisan-sourdough-bread-loaf-with-crispy-golden-cr.jpg"
                  alt="Rustic Sourdough"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="line-clamp-1 font-serif text-lg text-foreground transition-colors group-hover:text-primary">
                    Rustic Sourdough
                  </h3>
                  <p className="text-xs text-muted-foreground">24 hrs</p>
                </div>
              </div>
            </a>
          </BentoItem>

          {/* Quick Recipe 2 */}
          <BentoItem delay={250}>
            <a
              href="/recipes/spring-garden-pasta"
              className="group block h-full"
            >
              <div className="relative h-full overflow-hidden rounded-2xl bg-card">
                <img
                  src="/fresh-spring-pasta-with-green-vegetables-herbs-and.jpg"
                  alt="Spring Garden Pasta"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="line-clamp-1 font-serif text-lg text-foreground transition-colors group-hover:text-primary">
                    Spring Garden Pasta
                  </h3>
                  <p className="text-xs text-muted-foreground">25 min</p>
                </div>
              </div>
            </a>
          </BentoItem>

          {/* Wine Cellar Card */}
          <BentoItem className="row-span-2" delay={300}>
            <a href="/wine" className="group block h-full">
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
            </a>
          </BentoItem>

          {/* Meet Tay Card */}
          <BentoItem delay={350}>
            <a href="/about" className="group block h-full">
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
            </a>
          </BentoItem>

          {/* Shop Preview */}
          <BentoItem delay={400}>
            <a href="/shop" className="group block h-full">
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
            </a>
          </BentoItem>

          {/* Categories Row */}
          <BentoItem className="col-span-2" delay={450}>
            <div className="h-full overflow-hidden rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-serif text-xl text-foreground">
                  Browse Categories
                </h3>
                <a
                  href="/recipes"
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {[
                  "Breakfast",
                  "Dinner",
                  "Baking",
                  "Seasonal",
                  "Quick Meals",
                ].map((cat) => (
                  <a
                    key={cat}
                    href={`/recipes?category=${cat.toLowerCase()}`}
                    className="flex-shrink-0 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {cat}
                  </a>
                ))}
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
