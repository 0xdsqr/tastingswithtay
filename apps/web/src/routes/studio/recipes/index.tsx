import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Badge } from "@twt/ui/components/badge"
import { Button } from "@twt/ui/components/button"
import { Input } from "@twt/ui/components/input"
import { Spinner } from "@twt/ui/components/spinner"
import { Switch } from "@twt/ui/components/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@twt/ui/components/table"
import { ChefHat, Eye, Plus, Search, Star } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/recipes/")({
  component: RecipesListPage,
})

function RecipesListPage(): React.ReactElement {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const recipesQuery = useQuery(trpc.recipes.adminList.queryOptions())
  const recipes = recipesQuery.data ?? []

  const updateMutation = useMutation(
    trpc.recipes.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.recipes.adminList.queryKey(),
        })
      },
    }),
  )

  const filtered = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()),
  )

  const togglePublished = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { published: !current } })
  }

  const toggleFeatured = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { featured: !current } })
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Recipes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your recipe collection. Toggle publish to make them visible
            on the site.
          </p>
        </div>
        <Button asChild>
          <Link to="/studio/recipes/new">
            <Plus className="mr-2 size-4" />
            New Recipe
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {recipesQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <ChefHat className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {search ? "No recipes found" : "No recipes yet"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Create your first recipe to get started."}
          </p>
          {!search && (
            <Button asChild>
              <Link to="/studio/recipes/new">
                <Plus className="mr-2 size-4" />
                New Recipe
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-center">Views</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <Link
                      to="/studio/recipes/$id/edit"
                      params={{ id: recipe.id }}
                      className="font-medium hover:underline"
                    >
                      {recipe.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{recipe.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        recipe.difficulty === "Easy"
                          ? "default"
                          : recipe.difficulty === "Medium"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {recipe.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="size-3" />
                      {recipe.viewCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={recipe.published}
                      onCheckedChange={() =>
                        togglePublished(recipe.id, recipe.published)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={recipe.featured}
                      onCheckedChange={() =>
                        toggleFeatured(recipe.id, recipe.featured)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(recipe.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
