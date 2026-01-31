import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { ArrowLeft, Plus, X } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/wines/new")({
  component: NewWinePage,
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function NewWinePage(): React.ReactElement {
  const navigate = useNavigate()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [autoSlug, setAutoSlug] = useState(true)
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

  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation(
    trpc.wines.create.mutationOptions({
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

  const handleNameChange = (value: string) => {
    setName(value)
    if (autoSlug) {
      setSlug(slugify(value))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanAromas = aromas.filter((a) => a.trim() !== "")
    const cleanPairings = pairings.filter((p) => p.trim() !== "")

    createMutation.mutate({
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
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
          New Wine
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new wine tasting note. Save as draft or publish immediately.
        </p>
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
            <CardDescription>
              The essentials - name, winery, type, and grape variety.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Chateau Margaux 2015"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">URL Slug</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="rounded"
                    />
                    Auto-generate
                  </label>
                </div>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setAutoSlug(false)
                    setSlug(e.target.value)
                  }}
                  placeholder="chateau-margaux-2015"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="winery">Winery</Label>
                <Input
                  id="winery"
                  value={winery}
                  onChange={(e) => setWinery(e.target.value)}
                  placeholder="Chateau Margaux"
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
                  placeholder="Cabernet Sauvignon, Merlot"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Origin */}
        <Card>
          <CardHeader>
            <CardTitle>Origin</CardTitle>
            <CardDescription>Where does this wine come from?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Bordeaux"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="France"
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
                  placeholder="2015"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasting Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Tasting Notes</CardTitle>
            <CardDescription>
              Tay's rating, tasting notes, aromas, and food pairings.
            </CardDescription>
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
                  placeholder="4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Rich and velvety with notes of dark cherry and tobacco..."
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
            <CardDescription>Price range and occasion.</CardDescription>
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
                  placeholder="Date night, celebration..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
            <CardDescription>Add an image URL for the wine.</CardDescription>
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
            <CardDescription>
              Control visibility and featured status.
            </CardDescription>
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Wine"}
          </Button>
        </div>
      </form>
    </div>
  )
}
