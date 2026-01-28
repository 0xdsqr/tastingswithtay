import { createFileRoute } from "@tanstack/react-router"
import { BentoGrid } from "../components/bento-grid"
import { ImmersiveHero } from "../components/immersive-hero"
import { LatestPosts } from "../components/latest-posts"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ImmersiveHero />
        <BentoGrid />
        <LatestPosts />
      </main>
      <SiteFooter />
    </div>
  )
}
