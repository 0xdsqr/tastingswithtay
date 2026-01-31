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
import { ArrowLeft, GripVertical, Plus, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/recipes/$id/edit")({
  component: EditRecipePage,
})

type IngredientGroup = { group?: string; items: string[] }
type InstructionStep = { step: number; text: string }

function EditRecipePage(): React.ReactElement {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // Fetch all recipes and find by ID
  const recipesQuery = useQuery(trpc.recipes.adminList.queryOptions())
  const recipe = recipesQuery.data?.find((r) => r.id === id)

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState<string>("Easy")
  const [prepTime, setPrepTime] = useState("")
  const [cookTime, setCookTime] = useState("")
  const [servings, setServings] = useState("")
  const [image, setImage] = useState("")
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [tips, setTips] = useState<string[]>([])
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([
    { items: [""] },
  ])
  const [instructions, setInstructions] = useState<InstructionStep[]>([
    { step: 1, text: "" },
  ])
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when recipe data loads
  useEffect(() => {
    if (recipe && !initialized) {
      setTitle(recipe.title)
      setSlug(recipe.slug)
      setDescription(recipe.description)
      setCategory(recipe.category)
      setDifficulty(recipe.difficulty)
      setPrepTime(recipe.prepTime?.toString() ?? "")
      setCookTime(recipe.cookTime?.toString() ?? "")
      setServings(recipe.servings?.toString() ?? "")
      setImage(recipe.image ?? "")
      setPublished(recipe.published)
      setFeatured(recipe.featured)
      setTips((recipe.tips as string[]) ?? [])
      setIngredientGroups(
        (recipe.ingredients as IngredientGroup[]).length > 0
          ? (recipe.ingredients as IngredientGroup[])
          : [{ items: [""] }],
      )
      setInstructions(
        (recipe.instructions as InstructionStep[]).length > 0
          ? (recipe.instructions as InstructionStep[])
          : [{ step: 1, text: "" }],
      )
      setInitialized(true)
    }
  }, [recipe, initialized])

  const updateMutation = useMutation(
    trpc.recipes.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.recipes.adminList.queryKey(),
        })
        navigate({ to: "/studio/recipes" })
      },
      onError: (err) => {
        setError(err.message)
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.recipes.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.recipes.adminList.queryKey(),
        })
        navigate({ to: "/studio/recipes" })
      },
    }),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanIngredients = ingredientGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.trim() !== "") }))
      .filter((g) => g.items.length > 0)

    const cleanInstructions = instructions
      .filter((i) => i.text.trim() !== "")
      .map((i, idx) => ({ step: idx + 1, text: i.text }))

    const cleanTips = tips.filter((t) => t.trim() !== "")

    updateMutation.mutate({
      id,
      data: {
        title,
        slug,
        description,
        category,
        difficulty: difficulty as "Easy" | "Medium" | "Hard",
        prepTime: prepTime ? Number.parseInt(prepTime, 10) : undefined,
        cookTime: cookTime ? Number.parseInt(cookTime, 10) : undefined,
        servings: servings ? Number.parseInt(servings, 10) : undefined,
        ingredients: cleanIngredients,
        instructions: cleanInstructions,
        tips: cleanTips.length > 0 ? cleanTips : undefined,
        image: image || undefined,
        published,
        featured,
      },
    })
  }

  // Ingredient helpers
  const addIngredientItem = (groupIdx: number) => {
    setIngredientGroups((groups) =>
      groups.map((g, i) =>
        i === groupIdx ? { ...g, items: [...g.items, ""] } : g,
      ),
    )
  }

  const updateIngredientItem = (
    groupIdx: number,
    itemIdx: number,
    value: string,
  ) => {
    setIngredientGroups((groups) =>
      groups.map((g, gi) =>
        gi === groupIdx
          ? {
              ...g,
              items: g.items.map((item, ii) => (ii === itemIdx ? value : item)),
            }
          : g,
      ),
    )
  }

  const removeIngredientItem = (groupIdx: number, itemIdx: number) => {
    setIngredientGroups((groups) =>
      groups.map((g, gi) =>
        gi === groupIdx
          ? { ...g, items: g.items.filter((_, ii) => ii !== itemIdx) }
          : g,
      ),
    )
  }

  const addIngredientGroup = () => {
    setIngredientGroups((groups) => [...groups, { group: "", items: [""] }])
  }

  const updateGroupName = (groupIdx: number, name: string) => {
    setIngredientGroups((groups) =>
      groups.map((g, i) =>
        i === groupIdx ? { ...g, group: name || undefined } : g,
      ),
    )
  }

  const removeIngredientGroup = (groupIdx: number) => {
    setIngredientGroups((groups) => groups.filter((_, i) => i !== groupIdx))
  }

  // Instruction helpers
  const addInstruction = () => {
    setInstructions((steps) => [...steps, { step: steps.length + 1, text: "" }])
  }

  const updateInstruction = (idx: number, text: string) => {
    setInstructions((steps) =>
      steps.map((s, i) => (i === idx ? { ...s, text } : s)),
    )
  }

  const removeInstruction = (idx: number) => {
    setInstructions((steps) =>
      steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })),
    )
  }

  // Tips helpers
  const addTip = () => setTips((t) => [...t, ""])
  const updateTip = (idx: number, value: string) =>
    setTips((t) => t.map((tip, i) => (i === idx ? value : tip)))
  const removeTip = (idx: number) =>
    setTips((t) => t.filter((_, i) => i !== idx))

  if (recipesQuery.isPending || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-muted-foreground">Recipe not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate({ to: "/studio/recipes" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Recipes
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
            onClick={() => navigate({ to: "/studio/recipes" })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Recipes
          </Button>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Edit Recipe
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Editing: {recipe.title}
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
              <AlertDialogTitle>Delete this recipe?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{recipe.title}". This cannot be
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
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time & servings */}
        <Card>
          <CardHeader>
            <CardTitle>Time & Servings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>
                  Organize by groups or list items directly.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredientGroup}
              >
                <Plus className="mr-2 size-4" />
                Add Group
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {ingredientGroups.map((group, gi) => (
              <div key={gi} className="space-y-3">
                {ingredientGroups.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Input
                      value={group.group ?? ""}
                      onChange={(e) => updateGroupName(gi, e.target.value)}
                      placeholder="Group name (e.g., For the sauce)"
                      className="max-w-xs text-sm font-medium"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeIngredientGroup(gi)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                )}
                {group.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2">
                    <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={item}
                      onChange={(e) =>
                        updateIngredientItem(gi, ii, e.target.value)
                      }
                      placeholder="2 cups flour, 1 tsp salt..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeIngredientItem(gi, ii)}
                      disabled={group.items.length === 1}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addIngredientItem(gi)}
                >
                  <Plus className="mr-2 size-4" />
                  Add Ingredient
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {idx + 1}
                </div>
                <Textarea
                  value={step.text}
                  onChange={(e) => updateInstruction(idx, e.target.value)}
                  placeholder={`Step ${idx + 1}...`}
                  rows={2}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeInstruction(idx)}
                  disabled={instructions.length === 1}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addInstruction}
            >
              <Plus className="mr-2 size-4" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tips (optional)</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTip}
              >
                <Plus className="mr-2 size-4" />
                Add Tip
              </Button>
            </div>
          </CardHeader>
          {tips.length > 0 && (
            <CardContent className="space-y-3">
              {tips.map((tip, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={tip}
                    onChange={(e) => updateTip(idx, e.target.value)}
                    placeholder="A helpful tip..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeTip(idx)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          )}
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
                placeholder="/my-recipe-photo.jpg"
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
                  Make this recipe visible on the site.
                </p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Featured</Label>
                <p className="text-sm text-muted-foreground">
                  Show this recipe in featured sections.
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
            onClick={() => navigate({ to: "/studio/recipes" })}
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
