import { createFileRoute } from "@tanstack/react-router"
import { BentoGrid } from "../components/bento-grid"
import { ImmersiveHero } from "../components/immersive-hero"
import { LatestPosts } from "../components/latest-posts"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"
import { getHomeContent } from "../lib/site-content"

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [featuredRecipes, categories, sitePublication] = await Promise.all([
      context.queryClient.fetchQuery(context.trpc.recipes.featured.queryOptions()),
      context.queryClient.fetchQuery(context.trpc.recipes.categories.queryOptions()),
      context.queryClient.fetchQuery(context.trpc.site.published.queryOptions()),
    ])
    return { featuredRecipes, categories, homeContent: getHomeContent(sitePublication) }
  },
  component: Home,
})

function Home(): React.ReactElement {
  const { featuredRecipes, categories, homeContent } = Route.useLoaderData()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ImmersiveHero recipes={featuredRecipes} content={homeContent} />
        <BentoGrid recipes={featuredRecipes} categories={categories} content={homeContent} />
        <LatestPosts content={homeContent} />
      </main>
      <SiteFooter />
    </div>
  )
}
