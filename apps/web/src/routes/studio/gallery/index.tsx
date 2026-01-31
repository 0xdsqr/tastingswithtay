import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@twt/ui/components/alert-dialog"
import { Badge } from "@twt/ui/components/badge"
import { Button } from "@twt/ui/components/button"
import { Input } from "@twt/ui/components/input"
import { Spinner } from "@twt/ui/components/spinner"
import { Switch } from "@twt/ui/components/switch"
import { Image as ImageIcon, Plus, Search, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/gallery/")({
  component: GalleryListPage,
})

function GalleryListPage(): React.ReactElement {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const galleryQuery = useQuery(trpc.gallery.adminList.queryOptions())
  const images = galleryQuery.data ?? []

  const updateMutation = useMutation(
    trpc.gallery.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.gallery.adminList.queryKey(),
        })
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.gallery.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.gallery.adminList.queryKey(),
        })
      },
    }),
  )

  const filtered = images.filter(
    (img) =>
      (img.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (img.caption ?? "").toLowerCase().includes(search.toLowerCase()) ||
      img.category.toLowerCase().includes(search.toLowerCase()),
  )

  const togglePublished = (id: string, current: boolean) => {
    updateMutation.mutate({ id, data: { published: !current } })
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage Garden & Flock photos. Toggle publish to make them visible.
          </p>
        </div>
        <Button asChild>
          <Link to="/studio/gallery/new">
            <Plus className="mr-2 size-4" />
            Add Photo
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search photos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {galleryQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <ImageIcon className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {search ? "No photos found" : "No photos yet"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Add your first garden or flock photo."}
          </p>
          {!search && (
            <Button asChild>
              <Link to="/studio/gallery/new">
                <Plus className="mr-2 size-4" />
                Add Photo
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-lg border bg-card"
            >
              {/* Image */}
              <Link
                to="/studio/gallery/$id/edit"
                params={{ id: img.id }}
                className="block"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={img.image}
                    alt={img.title ?? "Gallery photo"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* Info overlay */}
              <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge
                    variant={
                      img.category === "garden" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {img.category === "garden" ? "Garden" : "Flock"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={img.published}
                      onCheckedChange={() =>
                        togglePublished(img.id, img.published)
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete photo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteMutation.mutate({ id: img.id })
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {img.title && (
                  <p className="truncate text-sm font-medium">{img.title}</p>
                )}
                {img.caption && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {img.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
