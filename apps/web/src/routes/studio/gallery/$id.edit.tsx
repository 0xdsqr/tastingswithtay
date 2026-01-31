import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
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
import { Button } from "@twt/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@twt/ui/components/card"
import { Input } from "@twt/ui/components/input"
import { Label } from "@twt/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@twt/ui/components/select"
import { Spinner } from "@twt/ui/components/spinner"
import { Switch } from "@twt/ui/components/switch"
import { Textarea } from "@twt/ui/components/textarea"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/gallery/$id/edit")({
  component: EditGalleryImagePage,
})

function EditGalleryImagePage(): React.ReactElement {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const galleryQuery = useQuery(trpc.gallery.adminList.queryOptions())
  const imageData = galleryQuery.data?.find((i) => i.id === id)

  const [title, setTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState("")
  const [category, setCategory] = useState("garden")
  const [sortOrder, setSortOrder] = useState("0")
  const [published, setPublished] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (imageData && !initialized) {
      setTitle(imageData.title ?? "")
      setCaption(imageData.caption ?? "")
      setImage(imageData.image)
      setCategory(imageData.category)
      setSortOrder(imageData.sortOrder.toString())
      setPublished(imageData.published)
      setInitialized(true)
    }
  }, [imageData, initialized])

  const updateMutation = useMutation(
    trpc.gallery.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.gallery.adminList.queryKey(),
        })
        navigate({ to: "/studio/gallery" })
      },
      onError: (err) => {
        setError(err.message)
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.gallery.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.gallery.adminList.queryKey(),
        })
        navigate({ to: "/studio/gallery" })
      },
    }),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    updateMutation.mutate({
      id,
      data: {
        title: title || undefined,
        caption: caption || undefined,
        image,
        category: category as "garden" | "flock",
        sortOrder: sortOrder ? Number.parseInt(sortOrder, 10) : undefined,
        published,
      },
    })
  }

  if (galleryQuery.isPending || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!imageData) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">Photo not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate({ to: "/studio/gallery" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Gallery
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/studio/gallery" })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Gallery
          </Button>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Edit Photo
          </h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate({ id })}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
              {image && (
                <div className="mt-2 aspect-video max-w-xs overflow-hidden rounded-lg border">
                  <img
                    src={image}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="garden">Garden</SelectItem>
                    <SelectItem value="flock">Flock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Published</Label>
                <p className="text-sm text-muted-foreground">
                  Make this photo visible on the site.
                </p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/studio/gallery" })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
