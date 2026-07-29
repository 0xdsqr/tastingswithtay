import { createFileRoute } from "@tanstack/react-router"
import type { Wine } from "@twt/database/schema"
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
import { WinePreview } from "../components/previews"
import { EditorWorkspace, PageHeader, RecordButton } from "../components/workspace"
import {
  createEmptyWine,
  deleteRecord,
  formatAdminDate,
  listWines,
  mapWineToForm,
  saveWine,
} from "../lib/admin-data"
import { toNumberOrNull, upsertByUpdatedAt } from "../lib/format"
import { confirmDiscard, useUnsavedChangesGuard } from "../lib/use-unsaved"

export const Route = createFileRoute("/_dashboard/wines")({
  loader: () => listWines(),
  component: WinesPage,
})

type WineForm = ReturnType<typeof createEmptyWine> & { id?: string }

const wineTypeOptions = ["Red", "White", "Rosé", "Sparkling", "Dessert"] as const
const priceRangeOptions = ["$", "$$", "$$$", "$$$$", "$$$$$"] as const

function WinesPage(): React.ReactElement {
  const loaded = Route.useLoaderData()
  const [items, setItems] = useState<Wine[]>(loaded as Wine[])
  const [searchValue, setSearchValue] = useState("")
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<WineForm>(createEmptyWine())
  const [snapshot, setSnapshot] = useState<string>(() => JSON.stringify(createEmptyWine()))
  const [isPending, startTransition] = useTransition()

  const isDirty = JSON.stringify(form) !== snapshot
  useUnsavedChangesGuard(isDirty)

  const selectedItem = items.find((item) => item.id === selectedId)

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) =>
      [item.name, item.winery, item.type].some((value) => value.toLowerCase().includes(query)),
    )
  }, [items, searchValue])

  const selectWine = (item?: Wine) => {
    if (!confirmDiscard(isDirty)) return
    const nextForm = item ? mapWineToForm(item) : createEmptyWine()
    setSelectedId(item?.id ?? "new")
    setForm(nextForm)
    setSnapshot(JSON.stringify(nextForm))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wines"
        description="Personal tasting entries with aromas, pairings, occasion notes, and feature state."
      />

      <EditorWorkspace
        listHeader="Wine cellar"
        listAction={
          <Button size="sm" onClick={() => selectWine()}>
            New wine
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
                title={item.name}
                subtitle={`${item.winery} • ${item.published ? "Published" : "Draft"}`}
                meta={formatAdminDate(item.updatedAt)}
                imageValue={item.image}
                onClick={() => selectWine(item)}
              />
            ))}
            {filteredItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {items.length === 0 ? "No wines yet." : "No wines match your search."}
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
                  const saved = (await saveWine({ data: form })) as Wine
                  setItems(upsertByUpdatedAt<Wine>(items, saved))
                  const nextForm = mapWineToForm(saved)
                  setSelectedId(saved.id)
                  setForm(nextForm)
                  setSnapshot(JSON.stringify(nextForm))
                  toast.success("Wine saved.")
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not save wine.")
                }
              })
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Winery">
                <Input
                  value={form.winery}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, winery: event.target.value }))
                  }
                />
              </Field>
              <Field label="Type">
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as (typeof wineTypeOptions)[number],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wineTypeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Region">
                <Input
                  value={form.region}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, region: event.target.value }))
                  }
                />
              </Field>
              <Field label="Country">
                <Input
                  value={form.country}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, country: event.target.value }))
                  }
                />
              </Field>
              <Field label="Vintage">
                <Input
                  type="number"
                  value={form.vintage ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      vintage: toNumberOrNull(event.target.value),
                    }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Grapes">
                <Input
                  value={form.grapes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, grapes: event.target.value }))
                  }
                />
              </Field>
              <Field label="Rating">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rating: toNumberOrNull(event.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Price range">
                <Select
                  value={form.priceRange ?? "none"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      priceRange:
                        value === "none" ? null : (value as (typeof priceRangeOptions)[number]),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    {priceRangeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Occasion">
                <Input
                  value={form.occasion}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, occasion: event.target.value }))
                  }
                />
              </Field>
            </div>
            <ImageUploadField
              label="Hero image"
              value={form.image}
              folder="wines"
              description="Bottle, glass, or vineyard photos work best."
              onChange={(value) => setForm((current) => ({ ...current, image: value }))}
            />
            <Field label="Notes">
              <Textarea
                rows={5}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field
                label="Aromas"
                description="One aroma per line. Keep them short for the public card layout."
              >
                <Textarea
                  rows={6}
                  value={form.aromasText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, aromasText: event.target.value }))
                  }
                  placeholder="One aroma per line"
                />
              </Field>
              <Field
                label="Pairings"
                description="One pairing per line. Use plain food names rather than long sentences."
              >
                <Textarea
                  rows={6}
                  value={form.pairingsText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, pairingsText: event.target.value }))
                  }
                  placeholder="One pairing per line"
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                label="Published"
                description="Published wines appear in the public wine cellar."
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, published: checked }))
                }
              />
              <ToggleField
                label="Featured"
                description="Featured wines can be highlighted in the admin overview."
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, featured: checked }))
                }
              />
            </div>
            <EditorActions
              primaryLabel={isPending ? "Saving..." : selectedItem ? "Save wine" : "Create wine"}
              primaryDisabled={isPending}
              deleteTitle={`Delete "${selectedItem?.name ?? "this wine"}"?`}
              deleteDescription="The wine is removed from the site permanently. This cannot be undone."
              onDelete={
                selectedItem
                  ? () => {
                      startTransition(async () => {
                        try {
                          await deleteRecord({ data: { kind: "wine", id: selectedItem.id } })
                          setItems(items.filter((item) => item.id !== selectedItem.id))
                          const nextForm = createEmptyWine()
                          setSelectedId("new")
                          setForm(nextForm)
                          setSnapshot(JSON.stringify(nextForm))
                          toast.success("Wine deleted.")
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Could not delete wine.",
                          )
                        }
                      })
                    }
                  : undefined
              }
            />
          </form>
        }
        preview={<WinePreview form={form} />}
      />
    </div>
  )
}
