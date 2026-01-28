import { Link } from "@tanstack/react-router"
import { Facebook, Instagram, Mail, Youtube } from "lucide-react"

const mainNavigation = [
  { name: "Recipes", href: "/recipes" },
  { name: "Wine Cellar", href: "/wine" },
  { name: "About", href: "/about" },
  { name: "Shop", href: "/shop" },
  { name: "Contact", href: "/contact" },
] as const

const socialLinks = [
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "YouTube", href: "#", icon: Youtube },
  { name: "Email", href: "mailto:hello@tastingswithtay.com", icon: Mail },
] as const

export function SiteFooter(): React.ReactElement {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <Link to="/" className="mb-8">
            <span className="font-serif text-2xl tracking-tight text-foreground">
              Tastings with Tay
            </span>
          </Link>

          {/* Navigation */}
          <nav className="mb-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
            {mainNavigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Social Links */}
          <div className="mb-8 flex gap-6">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          {/* Newsletter signup hint */}
          <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
            Subscribe to get the latest recipes, tips, and exclusive offers
            delivered to your inbox.
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tastings with Tay. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
