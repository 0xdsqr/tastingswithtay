import { createFileRoute } from "@tanstack/react-router"
import { RecipeCard } from "../../components/recipe-card"
import { RecipeFilters } from "../../components/recipe-filters"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"
import {
  getAllCategories,
  getRecipesByCategory,
  recipes,
} from "../../lib/data/recipes"

export const Route = createFileRoute("/recipes/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ deps }) => {
    const categories = getAllCategories()
    const filteredRecipes = deps.category
      ? getRecipesByCategory(deps.category)
      : recipes
    return {
      recipes: filteredRecipes,
      categories,
      activeCategory: deps.category,
    }
  },
  component: RecipesPage,
})

function RecipesPage(): React.ReactElement {
  const { recipes, categories, activeCategory } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                From the Kitchen
              </p>
              <h1 className="mb-6 font-serif text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Recipes
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Explore my collection of tried-and-true recipes, from quick
                weeknight dinners to weekend baking projects. Each one is made
                with love and meant to be shared.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="sticky top-[73px] z-40 border-b border-border bg-background/80 py-8 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <RecipeFilters
              categories={categories}
              activeCategory={activeCategory}
            />
          </div>
        </section>

        {/* Recipe Grid */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {recipes.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  No recipes found in this category yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
