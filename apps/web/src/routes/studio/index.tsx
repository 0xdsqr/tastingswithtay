import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Badge } from "@twt/ui/components/badge"
import { Button } from "@twt/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@twt/ui/components/card"
import { Spinner } from "@twt/ui/components/spinner"
import {
  Beaker,
  ChefHat,
  Library,
  Mail,
  MessageSquare,
  Plus,
  Wine,
} from "lucide-react"
import { useTRPC } from "../../lib/trpc"

export const Route = createFileRoute("/studio/")({
  component: StudioDashboard,
})

function StudioDashboard(): React.ReactElement {
  const trpc = useTRPC()

  const recipesQuery = useQuery(trpc.recipes.adminList.queryOptions())
  const winesQuery = useQuery(trpc.wines.adminList.queryOptions())
  const experimentsQuery = useQuery(trpc.experiments.adminList.queryOptions())
  const collectionsQuery = useQuery(trpc.collections.adminList.queryOptions())
  const subscriberCountQuery = useQuery(trpc.subscribers.count.queryOptions())

  const recipes = recipesQuery.data ?? []
  const wines = winesQuery.data ?? []
  const experiments = experimentsQuery.data ?? []
  const collections = collectionsQuery.data ?? []
  const subscriberCount = subscriberCountQuery.data ?? 0

  const publishedRecipes = recipes.filter((r) => r.published).length
  const draftRecipes = recipes.filter((r) => !r.published).length
  const publishedWines = wines.filter((w) => w.published).length
  const draftWines = wines.filter((w) => !w.published).length
  const activeExperiments = experiments.filter(
    (e) => e.status === "in_progress",
  ).length

  const isLoading =
    recipesQuery.isPending ||
    winesQuery.isPending ||
    experimentsQuery.isPending ||
    collectionsQuery.isPending ||
    subscriberCountQuery.isPending

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's an overview of your content.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recipes</CardTitle>
                <ChefHat className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recipes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {publishedRecipes} published, {draftRecipes} drafts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wines</CardTitle>
                <Wine className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wines.length}</div>
                <p className="text-xs text-muted-foreground">
                  {publishedWines} published, {draftWines} drafts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Experiments
                </CardTitle>
                <Beaker className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{experiments.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeExperiments} active in the test kitchen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscribers
                </CardTitle>
                <Mail className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriberCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active newsletter subscribers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/studio/recipes/new">
                  <Plus className="mr-2 size-4" />
                  New Recipe
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/studio/wines/new">
                  <Plus className="mr-2 size-4" />
                  New Wine
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/studio/experiments/new">
                  <Plus className="mr-2 size-4" />
                  New Experiment
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/studio/collections/new">
                  <Plus className="mr-2 size-4" />
                  New Collection
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent recipes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Recipes</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/studio/recipes">View all</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recipes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recipes yet. Create your first one!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recipes.slice(0, 5).map((recipe) => (
                      <Link
                        key={recipe.id}
                        to="/studio/recipes/$id/edit"
                        params={{ id: recipe.id }}
                        className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {recipe.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {recipe.category}
                          </p>
                        </div>
                        <Badge
                          variant={recipe.published ? "default" : "secondary"}
                          className="ml-2 shrink-0"
                        >
                          {recipe.published ? "Published" : "Draft"}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent wines */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Wines</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/studio/wines">View all</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {wines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No wines yet. Add your first tasting note!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {wines.slice(0, 5).map((wine) => (
                      <Link
                        key={wine.id}
                        to="/studio/wines/$id/edit"
                        params={{ id: wine.id }}
                        className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {wine.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {wine.winery} &middot; {wine.type}
                          </p>
                        </div>
                        <Badge
                          variant={wine.published ? "default" : "secondary"}
                          className="ml-2 shrink-0"
                        >
                          {wine.published ? "Published" : "Draft"}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
