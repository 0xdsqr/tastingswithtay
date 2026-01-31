import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@twt/ui/components/dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@twt/ui/components/table"
import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTRPC } from "../../../lib/trpc"

export const Route = createFileRoute("/studio/tags/")({
  component: TagsListPage,
})

interface TagFormData {
  name: string
  slug: string
  type: "recipe" | "wine" | "both"
}

const TAG_TYPES = ["all", "recipe", "wine", "both"] as const
type TagTypeFilter = (typeof TAG_TYPES)[number]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function TagsListPage(): React.ReactElement {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TagTypeFilter>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<{
    id: string
    name: string
    slug: string
    type: "recipe" | "wine" | "both"
  } | null>(null)
  const [form, setForm] = useState<TagFormData>({
    name: "",
    slug: "",
    type: "recipe",
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const tagsQuery = useQuery(trpc.tags.list.queryOptions())
  const tags = tagsQuery.data ?? []

  const createMutation = useMutation(
    trpc.tags.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.tags.list.queryKey() })
        closeDialog()
      },
    }),
  )

  const updateMutation = useMutation(
    trpc.tags.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.tags.list.queryKey() })
        closeDialog()
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.tags.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.tags.list.queryKey() })
      },
    }),
  )

  const filtered = tags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || tag.type === typeFilter
    return matchesSearch && matchesType
  })

  const openCreateDialog = () => {
    setEditingTag(null)
    setForm({ name: "", slug: "", type: "recipe" })
    setSlugManuallyEdited(false)
    setDialogOpen(true)
  }

  const openEditDialog = (tag: {
    id: string
    name: string
    slug: string
    type: string
  }) => {
    const tagType = (
      ["recipe", "wine", "both"].includes(tag.type) ? tag.type : "recipe"
    ) as TagFormData["type"]
    setEditingTag({ id: tag.id, name: tag.name, slug: tag.slug, type: tagType })
    setForm({ name: tag.name, slug: tag.slug, type: tagType })
    setSlugManuallyEdited(true)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingTag(null)
    setForm({ name: "", slug: "", type: "recipe" })
    setSlugManuallyEdited(false)
  }

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug: slugify(value) }))
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim()) return

    if (editingTag) {
      updateMutation.mutate({
        id: editingTag.id,
        data: { name: form.name, slug: form.slug, type: form.type },
      })
    } else {
      createMutation.mutate({
        name: form.name,
        slug: form.slug,
        type: form.type,
      })
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Tags</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize recipes and wines with tags.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 size-4" />
          New Tag
        </Button>
      </div>

      {/* Search & Type Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {TAG_TYPES.map((type) => (
            <Badge
              key={type}
              variant={typeFilter === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTypeFilter(type)}
            >
              {type === "all"
                ? "All"
                : type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {tagsQuery.isPending ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <Tags className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">
            {search || typeFilter !== "all" ? "No tags found" : "No tags yet"}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {search || typeFilter !== "all"
              ? "Try a different search term or filter."
              : "Create your first tag to organize content."}
          </p>
          {!search && typeFilter === "all" && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 size-4" />
              New Tag
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tag.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tag.type.charAt(0).toUpperCase() + tag.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(tag)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{tag.name}" and
                              remove it from all associated content. This cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteMutation.mutate({ id: tag.id })
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Update this tag's details."
                : "Create a new tag to organize your content."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Quick Meals"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. quick-meals"
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier. Auto-generated from name.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tag-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(value: "recipe" | "wine" | "both") =>
                  setForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger id="tag-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recipe">Recipe</SelectItem>
                  <SelectItem value="wine">Wine</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.slug.trim() || isSaving}
            >
              {isSaving && <Spinner className="mr-2 size-4" />}
              {editingTag ? "Save Changes" : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
