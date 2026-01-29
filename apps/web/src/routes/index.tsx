import { createFileRoute } from "@tanstack/react-router"
import { BentoGrid } from "../components/bento-grid"
import { ImmersiveHero } from "../components/immersive-hero"
import { LatestPosts } from "../components/latest-posts"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [featuredRecipes, categories] = await Promise.all([
      context.queryClient.fetchQuery(
        context.trpc.recipes.featured.queryOptions(),
      ),
      context.queryClient.fetchQuery(
        context.trpc.recipes.categories.queryOptions(),
      ),
    ])
    return { featuredRecipes, categories }
  },
  component: Home,
})

function Home(): React.ReactElement {
  const { featuredRecipes, categories } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ImmersiveHero recipes={featuredRecipes} />
        <BentoGrid recipes={featuredRecipes} categories={categories} />
        <LatestPosts />
      </main>
      <SiteFooter />
    </div>
  )
}
