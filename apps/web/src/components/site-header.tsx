import { Link } from "@tanstack/react-router"
import { Button } from "@twt/ui/components/button"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Recipes", to: "/recipes" },
  { name: "Wine Cellar", to: "/wine" },
  { name: "About", to: "/about" },
  { name: "Shop", to: "/shop" },
] as const

export function SiteHeader(): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Left nav - desktop */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.slice(0, 2).map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 text-foreground"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Logo - center */}
        <div className="flex flex-1 justify-center lg:flex-none">
          <Link to="/" className="flex flex-col items-center">
            <span className="font-serif text-2xl tracking-tight text-foreground lg:text-3xl">
              Tastings with Tay
            </span>
          </Link>
        </div>

        {/* Right nav - desktop */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          <Link
            to="/shop"
            className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
          <button
            type="button"
            className="p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </button>
          <Link
            to="/cart"
            className="relative p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        {/* Mobile icons */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/cart"
            className="p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Cart</span>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="space-y-1 px-6 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="block py-3 text-base font-medium text-foreground transition-colors hover:text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border pt-4">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
