import { createFileRoute, notFound } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { ArrowLeft, Calendar, Grape, MapPin, Star, Tag } from "lucide-react"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"
import { trpc } from "../../lib/trpc"

export const Route = createFileRoute("/wine/$slug")({
  loader: async ({ params }) => {
    const [wine, relatedWines] = await Promise.all([
      trpc.wines.bySlug.query({ slug: params.slug }),
      trpc.wines.list.query({ limit: 3 }),
    ])
    if (!wine) {
      throw notFound()
    }
    // Filter out current wine from related
    const related = relatedWines
      .filter((w) => w.slug !== params.slug)
      .slice(0, 3)
    return { wine, relatedWines: related }
  },
  component: WineDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-serif text-4xl">Wine not found</h1>
      <a href="/wine" className="mt-4 text-primary hover:underline">
        Back to Wine Cellar
      </a>
    </div>
  ),
})

const typeColors: Record<string, string> = {
  Red: "bg-[#722F37] text-white",
  White: "bg-[#F7E7CE] text-[#5C4A32]",
  Rosé: "bg-[#F4C2C2] text-[#8B4557]",
  Sparkling: "bg-[#FFD700]/20 text-[#8B7355]",
  Dessert: "bg-[#D4A574] text-white",
}

function WineDetailPage(): React.ReactElement {
  const { wine, relatedWines } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Back Link */}
        <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
          <a
            href="/wine"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Wine Cellar
          </a>
        </div>

        {/* Wine Detail */}
        <article className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted lg:aspect-square">
                {wine.image && (
                  <img
                    src={wine.image}
                    alt={wine.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col justify-center">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${typeColors[wine.type] ?? "bg-muted text-foreground"}`}
                  >
                    {wine.type}
                  </span>
                  {wine.occasion && (
                    <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                      {wine.occasion}
                    </span>
                  )}
                </div>

                <h1 className="mb-2 font-serif text-4xl text-foreground lg:text-5xl">
                  {wine.name}
                </h1>
                <p className="mb-6 text-xl text-muted-foreground">
                  {wine.winery}
                </p>

                {/* Rating */}
                {wine.rating && (
                  <div className="mb-8 flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < (wine.rating ?? 0)
                            ? "fill-primary text-primary"
                            : "text-muted"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      Tay's Rating
                    </span>
                  </div>
                )}

                {/* Quick Info */}
                <div className="mb-8 grid grid-cols-2 gap-4">
                  {(wine.region || wine.country) && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Region</p>
                        <p className="font-medium text-foreground">
                          {wine.region}
                          {wine.region && wine.country ? ", " : ""}
                          {wine.country}
                        </p>
                      </div>
                    </div>
                  )}
                  {wine.vintage && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Vintage</p>
                        <p className="font-medium text-foreground">
                          {wine.vintage}
                        </p>
                      </div>
                    </div>
                  )}
                  {wine.grapes && (
                    <div className="flex items-center gap-3 text-sm">
                      <Grape className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Grape</p>
                        <p className="font-medium text-foreground">
                          {wine.grapes}
                        </p>
                      </div>
                    </div>
                  )}
                  {wine.priceRange && (
                    <div className="flex items-center gap-3 text-sm">
                      <Tag className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-muted-foreground">Price Range</p>
                        <p className="font-medium text-foreground">
                          {wine.priceRange}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tasting Notes */}
                {wine.notes && (
                  <div className="mb-8">
                    <h2 className="mb-3 font-serif text-xl text-foreground">
                      Tasting Notes
                    </h2>
                    <p className="leading-relaxed text-foreground/80">
                      {wine.notes}
                    </p>
                  </div>
                )}

                {/* Aromas */}
                {wine.aromas && wine.aromas.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-3 font-serif text-xl text-foreground">
                      Aromas
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {wine.aromas.map((aroma: string) => (
                        <span
                          key={aroma}
                          className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground"
                        >
                          {aroma}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pairings */}
                {wine.pairings && wine.pairings.length > 0 && (
                  <div>
                    <h2 className="mb-3 font-serif text-xl text-foreground">
                      Perfect Pairings
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {wine.pairings.map((pairing: string) => (
                        <span
                          key={pairing}
                          className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                        >
                          {pairing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* More Wines */}
        {relatedWines.length > 0 && (
          <section className="bg-muted/30 py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-serif text-2xl text-foreground">
                  More from the Cellar
                </h2>
                <Button variant="outline" className="bg-transparent" asChild>
                  <a href="/wine">View All</a>
                </Button>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {relatedWines.map((w) => (
                  <a key={w.id} href={`/wine/${w.slug}`} className="group">
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                      {w.image && (
                        <img
                          src={w.image}
                          alt={w.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <h3 className="font-serif text-lg text-foreground transition-colors group-hover:text-primary">
                      {w.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{w.winery}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
