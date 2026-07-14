import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query"
import type { AppRouter } from "@twt/core/api"
import { ErrorBoundary } from "@twt/ui/components/error-boundary"
import { getServerSession } from "../auth/get-session"
import "../styles.css"

const faviconSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23722F37'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-family='Georgia,serif' font-size='20' fill='%23FAF7F2'%3ETT%3C/text%3E%3C/svg%3E"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  trpc: TRPCOptionsProxy<AppRouter>
}>()({
  loader: async ({ context }) => {
    const [session, sitePublication] = await Promise.all([
      getServerSession(),
      context.queryClient.fetchQuery(context.trpc.site.published.queryOptions()),
    ])
    return { session, sitePublication }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tastings with Tay | Recipes, Life & Good Food" },
      {
        name: "description",
        content:
          "Join Tay on a culinary journey through delicious recipes, lifestyle tips, and curated kitchen essentials.",
      },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "theme-color", content: "#722f37" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Tastings with Tay" },
      { property: "og:title", content: "Tastings with Tay | Recipes, Life & Good Food" },
      {
        property: "og:description",
        content: "Recipes, wine tastings, kitchen experiments, and stories from Tay.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "icon", href: faviconSvg }],
  }),
  component: RootComponent,
})

function RootComponent(): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-background px-4 py-2 text-foreground shadow focus:translate-y-0"
        >
          Skip to content
        </a>
        <ErrorBoundary>
          <div id="main-content" tabIndex={-1}>
            <Outlet />
          </div>
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  )
}
