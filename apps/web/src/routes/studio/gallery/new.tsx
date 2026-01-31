import { createFileRoute, useNavigate } from "@tanstack/react-router"
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
import { Switch } from "@twt/ui/components/switch"
import { Textarea } from "@twt/ui/components/textarea"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const Route = createFileRoute("/studio/gallery/new")({
  component: NewGalleryImagePage,
})

function NewGalleryImagePage(): React.ReactElement {
  const navigate = useNavigate()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState("")
  const [category, setCategory] = useState("garden")
  const [sortOrder, setSortOrder] = useState("0")
  const [published, setPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation(
    trpc.gallery.create.mutationOptions({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    createMutation.mutate({
      title: title || undefined,
      caption: caption || undefined,
      image,
      category: category as "garden" | "flock",
      sortOrder: sortOrder ? Number.parseInt(sortOrder, 10) : undefined,
      published,
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
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
          Add Photo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new photo to the Garden & Flock gallery.
        </p>
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
            <CardDescription>The image URL and category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/garden/tomatoes-june.jpg"
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
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caption (optional)</CardTitle>
            <CardDescription>
              A title and caption for this photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="First tomatoes of the season"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="A short description of what's in the photo..."
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Photo"}
          </Button>
        </div>
      </form>
    </div>
  )
}
