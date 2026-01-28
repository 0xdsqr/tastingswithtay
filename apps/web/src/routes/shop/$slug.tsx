import { createFileRoute } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"

export const Route = createFileRoute("/shop/$slug")({
  component: ProductDetailPage,
})

function ProductDetailPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <a
            href="/shop"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </a>
        </div>

        {/* Coming Soon */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <h2 className="mb-4 font-serif text-2xl text-foreground">
              Product Not Available
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              The shop is coming soon. Check back later!
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
