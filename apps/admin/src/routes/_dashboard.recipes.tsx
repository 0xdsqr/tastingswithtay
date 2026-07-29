import { createFileRoute } from "@tanstack/react-router"
import type { Recipe } from "@twt/database/schema"
import { Button } from "@twt/react/components/button"
import { Input } from "@twt/react/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@twt/react/components/select"
import { Textarea } from "@twt/react/components/textarea"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { EditorActions, Field, ToggleField } from "../components/form"
import { ImageUploadField } from "../components/image-upload-field"
import { RecipePreview } from "../components/previews"
import { EditorWorkspace, PageHeader, RecordButton } from "../components/workspace"
import {
  createEmptyRecipe,
  deleteRecord,
  formatAdminDate,
  listRecipes,
  mapRecipeToForm,
  saveRecipe,
} from "../lib/admin-data"
import { toNumberOrNull, upsertByUpdatedAt } from "../lib/format"
import { confirmDiscard, useUnsavedChangesGuard } from "../lib/use-unsaved"

export const Route = createFileRoute("/_dashboard/recipes")({
  loader: () => listRecipes(),
  component: RecipesPage,
})

type RecipeForm = ReturnType<typeof createEmptyRecipe> & { id?: string }

const difficultyOptions = ["Easy", "Medium", "Hard"] as const

function RecipesPage(): React.ReactElement {
  const loaded = Route.useLoaderData()
  const [items, setItems] = useState<Recipe[]>(loaded as Recipe[])
  const [searchValue, setSearchValue] = useState("")
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<RecipeForm>(createEmptyRecipe())
  const [snapshot, setSnapshot] = useState<string>(() => JSON.stringify(createEmptyRecipe()))
  const [isPending, startTransition] = useTransition()

  const isDirty = JSON.stringify(form) !== snapshot
  useUnsavedChangesGuard(isDirty)

  const selectedItem = items.find((item) => item.id === selectedId)

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) =>
      [item.title, item.category].some((value) => value.toLowerCase().includes(query)),
    )
  }, [items, searchValue])

  const selectRecipe = (item?: Recipe) => {
    if (!confirmDiscard(isDirty)) return
    const nextForm = item ? mapRecipeToForm(item) : createEmptyRecipe()
    setSelectedId(item?.id ?? "new")
    setForm(nextForm)
    setSnapshot(JSON.stringify(nextForm))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recipes"
        description="Structured recipe entries with steps, timings, hero images, and publish state."
      />

      <EditorWorkspace
        listHeader="Recipe library"
        listAction={
          <Button size="sm" onClick={() => selectRecipe()}>
            New recipe
          </Button>
        }
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        list={
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <RecordButton
                key={item.id}
                active={selectedId === item.id}
                title={item.title}
                subtitle={`${item.category} • ${item.published ? "Published" : "Draft"}`}
                meta={formatAdminDate(item.updatedAt)}
                imageValue={item.image}
                onClick={() => selectRecipe(item)}
              />
            ))}
            {filteredItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {items.length === 0 ? "No recipes yet." : "No recipes match your search."}
              </p>
            ) : null}
          </div>
        }
        editor={
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              startTransition(async () => {
                try {
                  const saved = (await saveRecipe({ data: form })) as Recipe
                  setItems(upsertByUpdatedAt<Recipe>(items, saved))
                  const nextForm = mapRecipeToForm(saved)
                  setSelectedId(saved.id)
                  setForm(nextForm)
                  setSnapshot(JSON.stringify(nextForm))
                  toast.success("Recipe saved.")
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not save recipe.")
                }
              })
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </Field>
              <Field label="Slug">
                <Input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  placeholder="Auto-generated if left blank"
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Category">
                <Input
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                />
              </Field>
              <Field label="Difficulty">
                <Select
                  value={form.difficulty}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      difficulty: value as (typeof difficultyOptions)[number],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Prep minutes">
                <Input
                  type="number"
                  value={form.prepTime ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      prepTime: toNumberOrNull(event.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Cook minutes">
                <Input
                  type="number"
                  value={form.cookTime ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      cookTime: toNumberOrNull(event.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Servings">
                <Input
                  type="number"
                  value={form.servings ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      servings: toNumberOrNull(event.target.value),
                    }))
                  }
                />
              </Field>
            </div>
            <ImageUploadField
              label="Hero image"
              value={form.image}
              folder="recipes"
              description="Use a finished-dish photo. Uploads are stored in RustFS automatically."
              onChange={(value) => setForm((current) => ({ ...current, image: value }))}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <Field
                label="Ingredients"
                description="Put each ingredient on its own line. Group headings end with a colon, with a blank line between groups. Check the Preview tab to see the result."
              >
                <Textarea
                  rows={10}
                  value={form.ingredientsText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, ingredientsText: event.target.value }))
                  }
                  placeholder={"Main:\n2 eggs\n1 cup flour\n\nSauce:\n1 tbsp butter"}
                />
              </Field>
              <Field
                label="Instructions"
                description="Put one step on each line. Numbering is optional; the app will clean it up and renumber."
              >
                <Textarea
                  rows={10}
                  value={form.instructionsText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, instructionsText: event.target.value }))
                  }
                  placeholder={"1. Prep the ingredients\n2. Cook\n3. Serve"}
                />
              </Field>
            </div>
            <Field
              label="Tips"
              description="One tip per line keeps the public recipe formatting clean."
            >
              <Textarea
                rows={4}
                value={form.tipsText}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tipsText: event.target.value }))
                }
                placeholder="One tip per line"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                label="Published"
                description="Published recipes can appear on the public site."
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, published: checked }))
                }
              />
              <ToggleField
                label="Featured"
                description="Featured recipes can feed the homepage hero and highlights."
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, featured: checked }))
                }
              />
            </div>
            <EditorActions
              primaryLabel={
                isPending ? "Saving..." : selectedItem ? "Save recipe" : "Create recipe"
              }
              primaryDisabled={isPending}
              deleteTitle={`Delete "${selectedItem?.title ?? "this recipe"}"?`}
              deleteDescription="The recipe is removed from the site permanently. This cannot be undone."
              onDelete={
                selectedItem
                  ? () => {
                      startTransition(async () => {
                        try {
                          await deleteRecord({ data: { kind: "recipe", id: selectedItem.id } })
                          setItems(items.filter((item) => item.id !== selectedItem.id))
                          const nextForm = createEmptyRecipe()
                          setSelectedId("new")
                          setForm(nextForm)
                          setSnapshot(JSON.stringify(nextForm))
                          toast.success("Recipe deleted.")
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Could not delete recipe.",
                          )
                        }
                      })
                    }
                  : undefined
              }
            />
          </form>
        }
        preview={<RecipePreview form={form} />}
      />
    </div>
  )
}
