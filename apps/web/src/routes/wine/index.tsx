import { createFileRoute } from "@tanstack/react-router"
import type { Wine } from "@twt/db/schema"
import { Button } from "@twt/ui/components/button"
import { ChevronRight, Star, Wine as WineIcon } from "lucide-react"
import { OptimizedImage } from "../../components/optimized-image"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"

const wineTypes = [
  "All",
  "Red",
  "White",
  "Rosé",
  "Sparkling",
  "Dessert",
] as const

export const Route = createFileRoute("/wine/")({
  validateSearch: (search: Record<string, unknown>) => ({
    type: (search.type as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ type: search.type }),
  loader: async ({ context, deps }) => {
    const wines = (await context.queryClient.fetchQuery(
      context.trpc.wines.list.queryOptions({ type: deps.type }),
    )) as Wine[]
    return { wines, activeType: deps.type ?? "All" }
  },
  component: WineCellarPage,
})

const typeColors: Record<string, string> = {
  Red: "bg-[#722F37] text-white",
  White: "bg-[#F7E7CE] text-[#5C4A32]",
  Rosé: "bg-[#F4C2C2] text-[#8B4557]",
  Sparkling: "bg-[#FFD700]/20 text-[#8B7355]",
  Dessert: "bg-[#D4A574] text-white",
}

function WineCard({ wine }: { wine: Wine }): React.ReactElement {
  return (
    <a href={`/wine/${wine.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          {wine.image && (
            <OptimizedImage
              src={wine.image}
              alt={wine.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${typeColors[wine.type] ?? "bg-muted text-foreground"}`}
            >
              {wine.type}
            </span>
          </div>
          {wine.vintage && (
            <div className="absolute bottom-4 left-4">
              <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                {wine.vintage}
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl text-foreground transition-colors group-hover:text-primary">
                {wine.name}
              </h3>
              <p className="text-sm text-muted-foreground">{wine.winery}</p>
            </div>
            {wine.rating && (
              <div className="flex shrink-0 items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < (wine.rating ?? 0)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            {wine.region}
            {wine.region && wine.country ? ", " : ""}
            {wine.country}
          </p>

          {wine.notes && (
            <p className="mb-4 line-clamp-2 text-sm text-foreground/80">
              {wine.notes}
            </p>
          )}

          {wine.aromas && wine.aromas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {wine.aromas.slice(0, 3).map((aroma) => (
                <span
                  key={aroma}
                  className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                >
                  {aroma}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </a>
  )
}

function WineCellarPage(): React.ReactElement {
  const { wines, activeType } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D1B2E] via-[#1A1014] to-[#0D0A0B]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#722F37] blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-[#C4A77D] blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
            <WineIcon className="mx-auto mb-6 h-12 w-12 text-[#C4A77D]" />
            <h1 className="text-balance mb-4 font-serif text-4xl text-[#FAF7F2] sm:text-5xl lg:text-6xl">
              The Wine Cellar
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#FAF7F2]/70">
              My personal collection of tasting notes, favorite discoveries, and
              perfect pairings. Because great food deserves great wine.
            </p>
          </div>
        </section>

        {/* Filter & Wine Grid */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Filter Tabs */}
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              {wineTypes.map((type) => (
                <a
                  key={type}
                  href={type === "All" ? "/wine" : `/wine?type=${type}`}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    activeType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {type}
                </a>
              ))}
            </div>

            {/* Wine Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {wines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))}
            </div>

            {/* Empty State */}
            {wines.length === 0 && (
              <div className="py-16 text-center">
                <WineIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No wines found in this category yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#2D1B2E] to-[#1A1014] p-8 lg:flex-row lg:p-12">
              <div>
                <h2 className="mb-2 font-serif text-2xl text-[#FAF7F2] lg:text-3xl">
                  Wine & Food Pairing Guide
                </h2>
                <p className="text-[#FAF7F2]/70">
                  Discover which wines pair perfectly with my recipes.
                </p>
              </div>
              <Button
                size="lg"
                className="shrink-0 bg-[#C4A77D] text-[#1A1014] hover:bg-[#B8976D]"
                asChild
              >
                <a href="/recipes" className="flex items-center gap-2">
                  Browse Recipes
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
