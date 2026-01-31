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
import { ArrowLeft, Plus, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/wines/$id/edit")({
  component: EditWinePage,
})

function EditWinePage(): React.ReactElement {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // Fetch all wines and find by ID
  const winesQuery = useQuery(trpc.wines.adminList.queryOptions())
  const wine = winesQuery.data?.find((w) => w.id === id)

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [winery, setWinery] = useState("")
  const [region, setRegion] = useState("")
  const [country, setCountry] = useState("")
  const [vintage, setVintage] = useState("")
  const [type, setType] = useState<string>("Red")
  const [grapes, setGrapes] = useState("")
  const [rating, setRating] = useState("")
  const [notes, setNotes] = useState("")
  const [aromas, setAromas] = useState<string[]>([])
  const [pairings, setPairings] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState("")
  const [occasion, setOccasion] = useState("")
  const [image, setImage] = useState("")
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when wine data loads
  useEffect(() => {
    if (wine && !initialized) {
      setName(wine.name)
      setSlug(wine.slug)
      setWinery(wine.winery)
      setRegion(wine.region ?? "")
      setCountry(wine.country ?? "")
      setVintage(wine.vintage?.toString() ?? "")
      setType(wine.type)
      setGrapes(wine.grapes ?? "")
      setRating(wine.rating?.toString() ?? "")
      setNotes(wine.notes ?? "")
      setAromas((wine.aromas as string[]) ?? [])
      setPairings((wine.pairings as string[]) ?? [])
      setPriceRange(wine.priceRange ?? "")
      setOccasion(wine.occasion ?? "")
      setImage(wine.image ?? "")
      setPublished(wine.published)
      setFeatured(wine.featured)
      setInitialized(true)
    }
  }, [wine, initialized])

  const updateMutation = useMutation(
    trpc.wines.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.wines.adminList.queryKey(),
        })
        navigate({ to: "/studio/wines" })
      },
      onError: (err) => {
        setError(err.message)
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.wines.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.wines.adminList.queryKey(),
        })
        navigate({ to: "/studio/wines" })
      },
    }),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanAromas = aromas.filter((a) => a.trim() !== "")
    const cleanPairings = pairings.filter((p) => p.trim() !== "")

    updateMutation.mutate({
      id,
      data: {
        name,
        slug,
        winery,
        region: region || undefined,
        country: country || undefined,
        vintage: vintage ? Number.parseInt(vintage, 10) : undefined,
        type: type as "Red" | "White" | "Rosé" | "Sparkling" | "Dessert",
        grapes: grapes || undefined,
        rating: rating ? Number.parseInt(rating, 10) : undefined,
        notes: notes || undefined,
        aromas: cleanAromas.length > 0 ? cleanAromas : undefined,
        pairings: cleanPairings.length > 0 ? cleanPairings : undefined,
        priceRange: (priceRange || undefined) as
          | "$"
          | "$$"
          | "$$$"
          | "$$$$"
          | "$$$$$"
          | undefined,
        occasion: occasion || undefined,
        image: image || undefined,
        published,
        featured,
      },
    })
  }

  // Aromas helpers
  const addAroma = () => setAromas((a) => [...a, ""])
  const updateAroma = (idx: number, value: string) =>
    setAromas((a) => a.map((item, i) => (i === idx ? value : item)))
  const removeAroma = (idx: number) =>
    setAromas((a) => a.filter((_, i) => i !== idx))

  // Pairings helpers
  const addPairing = () => setPairings((p) => [...p, ""])
  const updatePairing = (idx: number, value: string) =>
    setPairings((p) => p.map((item, i) => (i === idx ? value : item)))
  const removePairing = (idx: number) =>
    setPairings((p) => p.filter((_, i) => i !== idx))

  if (winesQuery.isPending || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!wine) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">Wine not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate({ to: "/studio/wines" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Wines
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
            onClick={() => navigate({ to: "/studio/wines" })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Wines
          </Button>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Edit Wine
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editing: {wine.name}
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
              <AlertDialogTitle>Delete this wine?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{wine.name}". This cannot be
                undone.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="winery">Winery</Label>
                <Input
                  id="winery"
                  value={winery}
                  onChange={(e) => setWinery(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Rosé">Rosé</SelectItem>
                    <SelectItem value="Sparkling">Sparkling</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="grapes">Grapes</Label>
                <Input
                  id="grapes"
                  value={grapes}
                  onChange={(e) => setGrapes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Origin */}
        <Card>
          <CardHeader>
            <CardTitle>Origin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vintage">Vintage</Label>
                <Input
                  id="vintage"
                  type="number"
                  min="1900"
                  max="2099"
                  value={vintage}
                  onChange={(e) => setVintage(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasting Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Tasting Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Aromas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Aromas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAroma}
                >
                  <Plus className="mr-2 size-4" />
                  Add Aroma
                </Button>
              </div>
              {aromas.map((aroma, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={aroma}
                    onChange={(e) => updateAroma(idx, e.target.value)}
                    placeholder="Dark cherry, tobacco, vanilla..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeAroma(idx)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Pairings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Food Pairings</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPairing}
                >
                  <Plus className="mr-2 size-4" />
                  Add Pairing
                </Button>
              </div>
              {pairings.map((pairing, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={pairing}
                    onChange={(e) => updatePairing(idx, e.target.value)}
                    placeholder="Grilled steak, aged cheese..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removePairing(idx)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range</Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$</SelectItem>
                    <SelectItem value="$$">$$</SelectItem>
                    <SelectItem value="$$$">$$$</SelectItem>
                    <SelectItem value="$$$$">$$$$</SelectItem>
                    <SelectItem value="$$$$$">$$$$$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/my-wine-photo.jpg"
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
                  Make this wine visible on the site.
                </p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Show this wine in featured sections.
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
            onClick={() => navigate({ to: "/studio/wines" })}
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
