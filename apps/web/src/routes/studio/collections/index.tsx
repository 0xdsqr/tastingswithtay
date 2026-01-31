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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@twt/ui/components/card"
import { Spinner } from "@twt/ui/components/spinner"
import { Switch } from "@twt/ui/components/switch"
import { Library, Pencil, Plus, Trash2 } from "lucide-react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/collections/")({
  component: CollectionsListPage,
})

function CollectionsListPage(): React.ReactElement {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const collectionsQuery = useQuery(trpc.collections.adminList.queryOptions())
  const collections = collectionsQuery.data ?? []

  const updateMutation = useMutation(
    trpc.collections.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.collections.adminList.queryKey(),
        })
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.collections.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.collections.adminList.queryKey(),
        })
      },
    }),
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
            Collections
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curate groups of recipes and wines for your readers.
          </p>
        </div>
        <Button asChild>
          <Link to="/studio/collections/new">
            <Plus className="mr-2 size-4" />
            New Collection
          </Link>
        </Button>
      </div>

      {collectionsQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <Library className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No collections yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Create a collection to group your recipes and wines.
          </p>
          <Button asChild>
            <Link to="/studio/collections/new">
              <Plus className="mr-2 size-4" />
              New Collection
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.id}>
              {collection.image && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {collection.name}
                    </CardTitle>
                    {collection.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {collection.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant={collection.published ? "default" : "secondary"}
                  >
                    {collection.published ? "Live" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`pub-${collection.id}`}
                      className="text-sm text-muted-foreground"
                    >
                      Published
                    </label>
                    <Switch
                      id={`pub-${collection.id}`}
                      checked={collection.published}
                      onCheckedChange={() =>
                        togglePublished(collection.id, collection.published)
                      }
                    />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link
                        to="/studio/collections/$id/edit"
                        params={{ id: collection.id }}
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete collection?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{collection.name}".
                            This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteMutation.mutate({ id: collection.id })
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
