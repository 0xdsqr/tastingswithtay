import { createFileRoute } from "@tanstack/react-router"
import type { Experiment, ExperimentEntry, Recipe } from "@twt/database/schema"
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
import { ArrowDown, ArrowUp } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { EditorActions, Field, ToggleField } from "../components/form"
import { ImageUploadField, imageUploadAccept } from "../components/image-upload-field"
import { ExperimentPreview } from "../components/previews"
import { EditorWorkspace, PageHeader, RecordButton } from "../components/workspace"
import {
  createEmptyExperiment,
  createEmptyExperimentEntry,
  deleteRecord,
  formatAdminDate,
  listExperiments,
  listRecipes,
  mapExperimentToForm,
  saveExperiment,
} from "../lib/admin-data"
import { humanizeExperimentStatus, splitPreviewLines, upsertByUpdatedAt } from "../lib/format"
import { imagePreviewSrcFor } from "../lib/image-health"
import { uploadImageFile } from "../lib/upload-client"
import { confirmDiscard, useUnsavedChangesGuard } from "../lib/use-unsaved"

export const Route = createFileRoute("/_dashboard/experiments")({
  loader: async () => {
    const [experiments, recipes] = await Promise.all([listExperiments(), listRecipes()])
    return { experiments, recipes }
  },
  component: ExperimentsPage,
})

type ExperimentWithEntries = Experiment & { entries: ExperimentEntry[] }
type ExperimentForm = ReturnType<typeof createEmptyExperiment> & { id?: string }

const experimentStatusOptions = ["in_progress", "paused", "completed", "graduated"] as const
const experimentEntryTypeOptions = ["update", "photo", "note", "result", "iteration"] as const

function ExperimentsPage(): React.ReactElement {
  const loaded = Route.useLoaderData()
  const recipes = loaded.recipes as Recipe[]
  const [items, setItems] = useState<ExperimentWithEntries[]>(
    loaded.experiments as ExperimentWithEntries[],
  )
  const [searchValue, setSearchValue] = useState("")
  const [selectedId, setSelectedId] = useState<string>("new")
  const [form, setForm] = useState<ExperimentForm>(createEmptyExperiment())
  const [snapshot, setSnapshot] = useState<string>(() => JSON.stringify(createEmptyExperiment()))
  const [isPending, startTransition] = useTransition()

  const isDirty = JSON.stringify(form) !== snapshot
  useUnsavedChangesGuard(isDirty)

  const selectedItem = items.find((item) => item.id === selectedId)

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return items
    return items.filter((item) =>
      [item.title, item.status].some((value) => value.toLowerCase().includes(query)),
    )
  }, [items, searchValue])

  const selectExperiment = (item?: ExperimentWithEntries) => {
    if (!confirmDiscard(isDirty)) return
    const nextForm = item ? mapExperimentToForm(item) : createEmptyExperiment()
    setSelectedId(item?.id ?? "new")
    setForm(nextForm)
    setSnapshot(JSON.stringify(nextForm))
  }

  const updateEntry = (
    index: number,
    patch: Partial<ReturnType<typeof createEmptyExperimentEntry>>,
  ) => {
    setForm((current) => ({
      ...current,
      entries: current.entries.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, ...patch } : entry,
      ),
    }))
  }

  const moveEntry = (index: number, direction: -1 | 1) => {
    setForm((current) => {
      const target = index + direction
      if (target < 0 || target >= current.entries.length) return current
      const entries = [...current.entries]
      const [moved] = entries.splice(index, 1)
      entries.splice(target, 0, moved!)
      return {
        ...current,
        entries: entries.map((entry, order) => ({ ...entry, sortOrder: order })),
      }
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Kitchen"
        description="Experiments have a parent entry plus a timeline of updates, notes, photos, and results."
      />

      <EditorWorkspace
        listHeader="Experiment log"
        listAction={
          <Button size="sm" onClick={() => selectExperiment()}>
            New experiment
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
                subtitle={`${humanizeExperimentStatus(item.status)} • ${item.published ? "Published" : "Draft"}`}
                meta={formatAdminDate(item.updatedAt)}
                imageValue={item.image}
                onClick={() => selectExperiment(item)}
              />
            ))}
            {filteredItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {items.length === 0 ? "No experiments yet." : "No experiments match your search."}
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
                  const saved = (await saveExperiment({ data: form })) as ExperimentWithEntries
                  setItems(upsertByUpdatedAt<ExperimentWithEntries>(items, saved))
                  const nextForm = mapExperimentToForm(saved)
                  setSelectedId(saved.id)
                  setForm(nextForm)
                  setSnapshot(JSON.stringify(nextForm))
                  toast.success("Experiment saved.")
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not save experiment.")
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
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Status">
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      status: value as (typeof experimentStatusOptions)[number],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experimentStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {humanizeExperimentStatus(option)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Graduated recipe">
                <Select
                  value={form.recipeId ?? "none"}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      recipeId: value === "none" ? null : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not linked</SelectItem>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <ImageUploadField
              label="Hero image"
              value={form.image}
              folder="experiments"
              description="Use the best photo for the experiment overview."
              onChange={(value) => setForm((current) => ({ ...current, image: value }))}
            />
            <Field label="Description">
              <Textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Hypothesis">
                <Textarea
                  rows={5}
                  value={form.hypothesis}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, hypothesis: event.target.value }))
                  }
                />
              </Field>
              <Field label="Result">
                <Textarea
                  rows={5}
                  value={form.result}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, result: event.target.value }))
                  }
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ToggleField
                label="Published"
                description="Published experiments appear on the public test-kitchen page."
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, published: checked }))
                }
              />
              <ToggleField
                label="Featured"
                description="Featured experiments can be highlighted in the admin overview."
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, featured: checked }))
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Experiment timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    Add the updates, notes, photo drops, and results that tell the story. Use the
                    arrows to reorder.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      entries: [
                        ...current.entries,
                        { ...createEmptyExperimentEntry(), sortOrder: current.entries.length },
                      ],
                    }))
                  }
                >
                  Add entry
                </Button>
              </div>
              <div className="space-y-4">
                {form.entries.map((entry, index) => (
                  <div key={entry.id ?? `entry-${index}`} className="rounded-md border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-sm font-medium">Entry {index + 1}</div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Move entry up"
                          disabled={index === 0}
                          onClick={() => moveEntry(index, -1)}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Move entry down"
                          disabled={index === form.entries.length - 1}
                          onClick={() => moveEntry(index, 1)}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                        {form.entries.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                entries: current.entries.filter(
                                  (_, currentIndex) => currentIndex !== index,
                                ),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Field label="Entry type">
                        <Select
                          value={entry.entryType}
                          onValueChange={(value) =>
                            updateEntry(index, {
                              entryType: value as (typeof experimentEntryTypeOptions)[number],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {experimentEntryTypeOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {humanizeExperimentStatus(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Content">
                        <Textarea
                          rows={5}
                          value={entry.content}
                          onChange={(event) => updateEntry(index, { content: event.target.value })}
                        />
                      </Field>
                      <EntryPhotos
                        imagesText={entry.imagesText}
                        onChange={(imagesText) => updateEntry(index, { imagesText })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <EditorActions
              primaryLabel={
                isPending ? "Saving..." : selectedItem ? "Save experiment" : "Create experiment"
              }
              primaryDisabled={isPending}
              deleteTitle={`Delete "${selectedItem?.title ?? "this experiment"}"?`}
              deleteDescription="The experiment and its whole timeline are removed permanently. This cannot be undone."
              onDelete={
                selectedItem
                  ? () => {
                      startTransition(async () => {
                        try {
                          await deleteRecord({
                            data: { kind: "experiment", id: selectedItem.id },
                          })
                          setItems(items.filter((item) => item.id !== selectedItem.id))
                          const nextForm = createEmptyExperiment()
                          setSelectedId("new")
                          setForm(nextForm)
                          setSnapshot(JSON.stringify(nextForm))
                          toast.success("Experiment deleted.")
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Could not delete experiment.",
                          )
                        }
                      })
                    }
                  : undefined
              }
            />
          </form>
        }
        preview={<ExperimentPreview form={form} />}
      />
    </div>
  )
}

function EntryPhotos({
  imagesText,
  onChange,
}: {
  imagesText: string
  onChange: (imagesText: string) => void
}): React.ReactElement {
  const [isUploading, setIsUploading] = useState(false)
  const images = splitPreviewLines(imagesText)

  const handleFile = async (file: File) => {
    setIsUploading(true)
    try {
      const uploaded = await uploadImageFile({ file, folder: "experiments" })
      onChange([...images, uploaded.url].join("\n"))
      toast.success("Photo added to this entry.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Field
      label="Entry photos"
      description="Photos upload straight into this entry — no copying links around."
    >
      <div className="space-y-3">
        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative">
                <div className="h-20 w-24 overflow-hidden rounded-md border bg-muted">
                  {imagePreviewSrcFor(image) ? (
                    <img
                      src={imagePreviewSrcFor(image)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                      Unrecognized image
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-1 w-full"
                  onClick={() =>
                    onChange(images.filter((_, currentIndex) => currentIndex !== index).join("\n"))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        <Input
          type="file"
          accept={imageUploadAccept}
          disabled={isUploading}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ""
            if (file) void handleFile(file)
          }}
        />
        {isUploading ? <p className="text-xs text-muted-foreground">Uploading...</p> : null}
      </div>
    </Field>
  )
}
