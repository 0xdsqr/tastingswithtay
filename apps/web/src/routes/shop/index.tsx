import { createFileRoute } from "@tanstack/react-router"
import { ShoppingBag } from "lucide-react"
import { SiteFooter } from "../../components/site-footer"
import { SiteHeader } from "../../components/site-header"

export const Route = createFileRoute("/shop/")({
  component: ShopPage,
})

function ShopPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Curated Essentials
              </p>
              <h1 className="mb-6 font-serif text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Shop
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                A collection of kitchen tools and home goods I genuinely love
                and use every day. Each piece is chosen for its quality, beauty,
                and the joy it brings to cooking.
              </p>
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-muted-foreground/50" />
            <h2 className="mb-4 font-serif text-2xl text-foreground">
              Coming Soon
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              We're curating the perfect collection of kitchen essentials for
              you. Check back soon!
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
