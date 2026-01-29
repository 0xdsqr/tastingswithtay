import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react"
import { OptimizedImage } from "../components/optimized-image"
import { SiteFooter } from "../components/site-footer"
import { SiteHeader } from "../components/site-header"

export const Route = createFileRoute("/cart")({
  component: CartPage,
})

// Placeholder cart data - will be replaced with real state management
const cartItems = [
  {
    id: "1",
    name: "Ceramic Mixing Bowl Set",
    price: 68,
    quantity: 1,
    image: "/elegant-cream-ceramic-mixing-bowls-stacked-kitchen.jpg",
  },
  {
    id: "2",
    name: "Linen Kitchen Towels",
    price: 34,
    quantity: 2,
    image: "/natural-linen-kitchen-towels-folded-neatly.jpg",
  },
]

function CartPage(): React.ReactElement {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const shipping = subtotal >= 75 ? 0 : 8
  const total = subtotal + shipping

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <h1 className="mb-8 font-serif text-3xl text-foreground sm:text-4xl">
            Your Cart
          </h1>

          {cartItems.length > 0 ? (
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="divide-y divide-border">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 py-6">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <OptimizedImage
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-4">
                          <h3 className="font-medium text-foreground">
                            {item.name}
                          </h3>
                          <button
                            type="button"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </button>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          ${item.price}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex items-center rounded border border-border">
                            <button
                              type="button"
                              className="p-2 transition-colors hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="p-2 transition-colors hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <a
                    href="/shop"
                    className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                    Continue Shopping
                  </a>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-lg bg-secondary p-6">
                  <h2 className="mb-6 font-serif text-xl text-foreground">
                    Order Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {shipping === 0 ? "Free" : `$${shipping}`}
                      </span>
                    </div>
                    {subtotal < 75 && (
                      <p className="text-xs text-muted-foreground">
                        Add ${75 - subtotal} more for free shipping
                      </p>
                    )}
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">${total}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="mt-6 w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Taxes calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 font-serif text-2xl text-foreground">
                Your cart is empty
              </h2>
              <p className="mb-6 text-muted-foreground">
                Looks like you haven't added anything yet.
              </p>
              <Button asChild>
                <a href="/shop">Browse Shop</a>
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
