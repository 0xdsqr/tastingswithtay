import { createFileRoute, notFound } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Heart,
  Printer,
  Share2,
  Users,
} from "lucide-react"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"
import { getRecipeBySlug } from "../../lib/data/recipes"

export const Route = createFileRoute("/recipes/$slug")({
  loader: async ({ params }) => {
    const recipe = getRecipeBySlug(params.slug)
    if (!recipe) {
      throw notFound()
    }
    return { recipe }
  },
  component: RecipeDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-serif text-4xl">Recipe not found</h1>
      <a href="/recipes" className="mt-4 text-primary hover:underline">
        Back to recipes
      </a>
    </div>
  ),
})

function RecipeDetailPage(): React.ReactElement {
  const { recipe } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          {/* Back link */}
          <div className="absolute left-6 top-6 z-10">
            <a
              href="/recipes"
              className="inline-flex items-center rounded-full bg-foreground/20 px-4 py-2 text-sm text-primary-foreground/80 backdrop-blur-sm transition-colors hover:text-primary-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Recipes
            </a>
          </div>

          {/* Hero Image */}
          <div className="relative h-[50vh] lg:h-[60vh]">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
              <div className="mx-auto max-w-4xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-medium tracking-wide text-foreground backdrop-blur-sm">
                    {recipe.category}
                  </span>
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
                <h1 className="text-balance font-serif text-3xl tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                  {recipe.title}
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Meta Bar */}
        <section className="border-b border-border bg-secondary">
          <div className="mx-auto max-w-4xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    <strong className="text-foreground">{recipe.time}</strong>{" "}
                    total
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    <strong className="text-foreground">
                      {recipe.servings}
                    </strong>{" "}
                    servings
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4" />
                  <span>
                    Prep:{" "}
                    <strong className="text-foreground">
                      {recipe.prepTime}
                    </strong>
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Heart className="h-4 w-4" />
                  <span className="sr-only">Save recipe</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Printer className="h-4 w-4" />
                  <span className="sr-only">Print recipe</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share recipe</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Content */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-6">
            {/* Description */}
            <p className="mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {recipe.description}
            </p>

            <div className="grid gap-12 lg:grid-cols-3">
              {/* Ingredients Sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-32">
                  <h2 className="mb-6 font-serif text-2xl text-foreground">
                    Ingredients
                  </h2>
                  <div className="space-y-6">
                    {recipe.ingredients.map((group, idx) => (
                      <div key={idx}>
                        {group.group && (
                          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                            {group.group}
                          </h3>
                        )}
                        <ul className="space-y-2">
                          {group.items.map((item, itemIdx) => (
                            <li
                              key={itemIdx}
                              className="flex items-start gap-3 text-foreground"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2">
                <h2 className="mb-6 font-serif text-2xl text-foreground">
                  Instructions
                </h2>
                <ol className="space-y-8">
                  {recipe.instructions.map((instruction) => (
                    <li key={instruction.step} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                        {instruction.step}
                      </span>
                      <p className="pt-1 leading-relaxed text-foreground">
                        {instruction.text}
                      </p>
                    </li>
                  ))}
                </ol>

                {/* Tips */}
                {recipe.tips && recipe.tips.length > 0 && (
                  <div className="mt-12 rounded-lg bg-secondary p-6">
                    <h3 className="mb-4 font-serif text-xl text-foreground">
                      Tips & Notes
                    </h3>
                    <ul className="space-y-2">
                      {recipe.tips.map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <span className="text-accent">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                <div className="mt-8 border-t border-border pt-8">
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
