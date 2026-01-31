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
import { Badge } from "@twt/ui/components/badge"
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
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/experiments/$id/edit")({
  component: EditExperimentPage,
})

const entryTypeLabels: Record<string, string> = {
  update: "Update",
  photo: "Photo",
  note: "Note",
  result: "Result",
  iteration: "Iteration",
}

function EditExperimentPage(): React.ReactElement {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // Fetch experiment
  const experimentsQuery = useQuery(trpc.experiments.adminList.queryOptions())
  const experiment = experimentsQuery.data?.find((e) => e.id === id)

  // Fetch entries
  const entriesQuery = useQuery(
    trpc.experiments.entries.queryOptions({ experimentId: id }),
  )
  const entries = entriesQuery.data ?? []

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("in_progress")
  const [hypothesis, setHypothesis] = useState("")
  const [result, setResult] = useState("")
  const [image, setImage] = useState("")
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New entry form
  const [newEntryContent, setNewEntryContent] = useState("")
  const [newEntryType, setNewEntryType] = useState("update")
  const [newEntryImages, setNewEntryImages] = useState<string[]>([])

  // Populate form
  useEffect(() => {
    if (experiment && !initialized) {
      setTitle(experiment.title)
      setSlug(experiment.slug)
      setDescription(experiment.description)
      setStatus(experiment.status)
      setHypothesis(experiment.hypothesis ?? "")
      setResult(experiment.result ?? "")
      setImage(experiment.image ?? "")
      setPublished(experiment.published)
      setFeatured(experiment.featured)
      setInitialized(true)
    }
  }, [experiment, initialized])

  const updateMutation = useMutation(
    trpc.experiments.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.experiments.adminList.queryKey(),
        })
        navigate({ to: "/studio/experiments" })
      },
      onError: (err) => {
        setError(err.message)
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.experiments.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.experiments.adminList.queryKey(),
        })
        navigate({ to: "/studio/experiments" })
      },
    }),
  )

  const createEntryMutation = useMutation(
    trpc.experiments.createEntry.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.experiments.entries.queryKey({ experimentId: id }),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.experiments.adminList.queryKey(),
        })
        setNewEntryContent("")
        setNewEntryType("update")
        setNewEntryImages([])
      },
    }),
  )

  const deleteEntryMutation = useMutation(
    trpc.experiments.deleteEntry.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.experiments.entries.queryKey({ experimentId: id }),
        })
      },
    }),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    updateMutation.mutate({
      id,
      data: {
        title,
        slug,
        description,
        status: status as "in_progress" | "paused" | "completed" | "graduated",
        hypothesis: hypothesis || undefined,
        result: result || undefined,
        image: image || undefined,
        published,
        featured,
      },
    })
  }

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntryContent.trim()) return

    createEntryMutation.mutate({
      experimentId: id,
      content: newEntryContent,
      entryType: newEntryType as
        | "update"
        | "photo"
        | "note"
        | "result"
        | "iteration",
      images: newEntryImages.filter((i) => i.trim() !== ""),
    })
  }

  if (experimentsQuery.isPending || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!experiment) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">Experiment not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate({ to: "/studio/experiments" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Experiments
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/studio/experiments" })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Experiments
          </Button>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Edit Experiment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editing: {experiment.title}
          </p>
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
              <AlertDialogTitle>Delete this experiment?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{experiment.title}" and all its
                entries. This cannot be undone.
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form - left 2 columns */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hypothesis & Result */}
          <Card>
            <CardHeader>
              <CardTitle>Hypothesis & Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hypothesis">Hypothesis (optional)</Label>
                <Textarea
                  id="hypothesis"
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  placeholder="What do you think will happen?"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="result">Result (optional)</Label>
                <Textarea
                  id="result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="What was the outcome?"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/my-experiment-photo.jpg"
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
            </CardContent>
          </Card>

          {/* Publish settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this experiment visible on the site.
                  </p>
                </div>
                <Switch checked={published} onCheckedChange={setPublished} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">
                    Pin this experiment to the top.
                  </p>
                </div>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/studio/experiments" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        {/* Entries sidebar - right column */}
        <div className="space-y-6">
          {/* Add new entry */}
          <Card>
            <CardHeader>
              <CardTitle>Add Entry</CardTitle>
              <CardDescription>
                Post an update to the experiment timeline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newEntryType} onValueChange={setNewEntryType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="result">Result</SelectItem>
                      <SelectItem value="iteration">Iteration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={newEntryContent}
                    onChange={(e) => setNewEntryContent(e.target.value)}
                    placeholder="What happened in the kitchen today?"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Images (optional)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewEntryImages((imgs) => [...imgs, ""])}
                    >
                      <Plus className="mr-1 size-3" />
                      Add
                    </Button>
                  </div>
                  {newEntryImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={img}
                        onChange={(e) =>
                          setNewEntryImages((imgs) =>
                            imgs.map((i, j) =>
                              j === idx ? e.target.value : i,
                            ),
                          )
                        }
                        placeholder="Image URL"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          setNewEntryImages((imgs) =>
                            imgs.filter((_, j) => j !== idx),
                          )
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createEntryMutation.isPending || !newEntryContent.trim()
                  }
                >
                  {createEntryMutation.isPending ? "Adding..." : "Add Entry"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing entries */}
          <Card>
            <CardHeader>
              <CardTitle>
                Timeline ({entries.length}{" "}
                {entries.length === 1 ? "entry" : "entries"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entriesQuery.isPending ? (
                <div className="flex justify-center py-4">
                  <Spinner className="size-6" />
                </div>
              ) : entries.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No entries yet. Add one above.
                </p>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {entryTypeLabels[entry.entryType] ?? entry.entryType}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <Trash2 className="size-3 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete this entry?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteEntryMutation.mutate({
                                      id: entry.id,
                                    })
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
                      <p className="line-clamp-3 text-sm text-foreground">
                        {entry.content}
                      </p>
                      {entry.images &&
                        (entry.images as string[]).length > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {(entry.images as string[]).length} image(s)
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
