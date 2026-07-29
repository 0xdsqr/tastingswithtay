import { createFileRoute } from "@tanstack/react-router"
import type { GalleryImage } from "@twt/database/schema"
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
import { GalleryPreview } from "../components/previews"
import { EditorWorkspace, PageHeader, RecordButton } from "../components/workspace"
import {
  createEmptyGalleryImage,
  deleteRecord,
  formatAdminDate,
  listGalleryImages,
  mapGalleryToForm,
  saveGalleryImage,
} from "../lib/admin-data"
import { capitalize, upsertByUpdatedAt } from "../lib/format"
import { confirmDiscard, useUnsavedChangesGuard } from "../lib/use-unsaved"

export const Route = createFileRoute("/_dashboard/gallery")({
  loader: () => listGalleryImages(),
  component: GalleryPage,
})

type GalleryForm = ReturnType<typeof createEmptyGalleryImage> & { id?: string }

const galleryCategoryOptions = ["garden", "flock"] as const

function GalleryPage(): React.ReactElement {
  const loaded = Route.useLoaderData()
  const [items, setItems] = useState<GalleryImage[]>(loaded as GalleryImage[])
  const [searchValue, setSearchValue] = useState("")
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<GalleryForm>(createEmptyGalleryImage())
  const [snapshot, setSnapshot] = useState<string>(() => JSON.stringify(createEmptyGalleryImage()))
  const [isPending, startTransition] = useTransition()

  const isDirty = JSON.stringify(form) !== snapshot
  useUnsavedChangesGuard(isDirty)

  const selectedItem = items.find((item) => item.id === selectedId)

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) =>
      [item.title ?? "", item.caption ?? "", item.category].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [items, searchValue])

  const selectGalleryImage = (item?: GalleryImage) => {
    if (!confirmDiscard(isDirty)) return
    const nextForm = item ? mapGalleryToForm(item) : createEmptyGalleryImage()
    setSelectedId(item?.id ?? "new")
    setForm(nextForm)
    setSnapshot(JSON.stringify(nextForm))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Garden & Flock"
        description="Gallery entries for the homestead page, including captions, categories, and display order."
      />

      <EditorWorkspace
        listHeader="Image library"
        listAction={
          <Button size="sm" onClick={() => selectGalleryImage()}>
            New image
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
                title={item.title || "Untitled image"}
                subtitle={`${capitalize(item.category)} • ${item.published ? "Published" : "Draft"}`}
                meta={formatAdminDate(item.updatedAt)}
                imageValue={item.image}
                onClick={() => selectGalleryImage(item)}
              />
            ))}
            {filteredItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {items.length === 0 ? "No gallery photos yet." : "No photos match your search."}
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
                  const saved = (await saveGalleryImage({ data: form })) as GalleryImage
                  setItems(upsertByUpdatedAt<GalleryImage>(items, saved))
                  const nextForm = mapGalleryToForm(saved)
                  setSelectedId(saved.id)
                  setForm(nextForm)
                  setSnapshot(JSON.stringify(nextForm))
                  toast.success("Gallery image saved.")
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not save image.")
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
              <Field label="Category">
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      category: value as (typeof galleryCategoryOptions)[number],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {galleryCategoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {capitalize(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Caption">
              <Textarea
                rows={4}
                value={form.caption}
                onChange={(event) =>
                  setForm((current) => ({ ...current, caption: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <ImageUploadField
                label="Image"
                value={form.image}
                folder="gallery"
                description="Upload garden or flock images here, then publish when the caption is ready."
                onChange={(value) => setForm((current) => ({ ...current, image: value }))}
              />
              <Field label="Taken at">
                <Input
                  type="date"
                  value={form.takenAt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, takenAt: event.target.value }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Display order"
                description="Lower numbers show first on the public page."
              >
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value || 0),
                    }))
                  }
                />
              </Field>
              <ToggleField
                label="Published"
                description="Published images appear on the public gallery."
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, published: checked }))
                }
              />
              <ToggleField
                label="Featured"
                description="Reserve for special highlights."
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, featured: checked }))
                }
              />
            </div>
            <EditorActions
              primaryLabel={isPending ? "Saving..." : selectedItem ? "Save image" : "Create image"}
              primaryDisabled={isPending}
              deleteTitle={`Delete "${selectedItem?.title || "this image"}"?`}
              deleteDescription="The gallery entry is removed from the site permanently. This cannot be undone."
              onDelete={
                selectedItem
                  ? () => {
                      startTransition(async () => {
                        try {
                          await deleteRecord({ data: { kind: "gallery", id: selectedItem.id } })
                          setItems(items.filter((item) => item.id !== selectedItem.id))
                          const nextForm = createEmptyGalleryImage()
                          setSelectedId("new")
                          setForm(nextForm)
                          setSnapshot(JSON.stringify(nextForm))
                          toast.success("Gallery image deleted.")
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Could not delete image.",
                          )
                        }
                      })
                    }
                  : undefined
              }
            />
          </form>
        }
        preview={<GalleryPreview form={form} />}
      />
    </div>
  )
}
