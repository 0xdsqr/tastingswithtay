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
import { Plus, Search, Star, Wine } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/wines/")({
  component: WinesListPage,
})

function WinesListPage(): React.ReactElement {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const winesQuery = useQuery(trpc.wines.adminList.queryOptions())
  const wines = winesQuery.data ?? []

  const updateMutation = useMutation(
    trpc.wines.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.wines.adminList.queryKey(),
        })
      },
    }),
  )

  const filtered = wines.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.winery.toLowerCase().includes(search.toLowerCase()) ||
      w.type.toLowerCase().includes(search.toLowerCase()),
  )

  const togglePublished = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { published: !current } })
  }

  const toggleFeatured = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { featured: !current } })
  }

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground">--</span>
    return (
      <span className="inline-flex items-center gap-1">
        <Star className="size-3 fill-amber-400 text-amber-400" />
        {rating}/5
      </span>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Wines
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your wine cellar and tasting notes.
          </p>
        </div>
        <Button asChild>
          <Link to="/studio/wines/new">
            <Plus className="mr-2 size-4" />
            New Wine
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search wines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {winesQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <Wine className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {search ? "No wines found" : "No wines yet"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Add your first wine to get started."}
          </p>
          {!search && (
            <Button asChild>
              <Link to="/studio/wines/new">
                <Plus className="mr-2 size-4" />
                New Wine
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Winery</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Published</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((wine) => (
                <TableRow key={wine.id}>
                  <TableCell>
                    <Link
                      to="/studio/wines/$id/edit"
                      params={{ id: wine.id }}
                      className="font-medium hover:underline"
                    >
                      {wine.name}
                    </Link>
                    {wine.vintage && (
                      <span className="ml-1 text-muted-foreground">
                        ({wine.vintage})
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{wine.winery}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{wine.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {renderRating(wine.rating)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {wine.priceRange ?? "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={wine.published}
                      onCheckedChange={() =>
                        togglePublished(wine.id, wine.published)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={wine.featured}
                      onCheckedChange={() =>
                        toggleFeatured(wine.id, wine.featured)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(wine.updatedAt).toLocaleDateString()}
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
