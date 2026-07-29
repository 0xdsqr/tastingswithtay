import { createFileRoute } from "@tanstack/react-router"
import { managedAssetFolders, type ManagedAssetFolder } from "@twt/core/images/policy"
import { Button } from "@twt/react/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@twt/react/components/card"
import { Input } from "@twt/react/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@twt/react/components/select"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ConfirmDeleteButton } from "../components/form"
import { UploadProgressBar, imageUploadAccept } from "../components/image-upload-field"
import { PageHeader } from "../components/workspace"
import { type ManagedImageAsset, deleteManagedAsset, listManagedAssets } from "../lib/admin-assets"
import { formatAdminDate } from "../lib/admin-data"
import { capitalize, formatBytes } from "../lib/format"
import { imagePreviewSrcFor } from "../lib/image-health"
import { uploadImageFile } from "../lib/upload-client"

export const Route = createFileRoute("/_dashboard/media")({
  loader: () => listManagedAssets({ data: { folder: "all", limit: 60 } }),
  component: MediaPage,
})

type FolderFilter = "all" | ManagedAssetFolder

function MediaPage(): React.ReactElement {
  const firstPage = Route.useLoaderData()
  const [folder, setFolder] = useState<FolderFilter>("all")
  const [uploadFolder, setUploadFolder] = useState<ManagedAssetFolder>("uploads")
  const [assets, setAssets] = useState<ManagedImageAsset[]>(firstPage.assets)
  const [nextCursor, setNextCursor] = useState<string | null>(firstPage.nextCursor)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadPage = (targetFolder: FolderFilter, cursor?: string) => {
    startTransition(async () => {
      try {
        const page = await listManagedAssets({
          data: { folder: targetFolder, limit: 60, cursor },
        })
        setAssets((current) => (cursor ? [...current, ...page.assets] : page.assets))
        setNextCursor(page.nextCursor)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load images.")
      }
    })
  }

  const changeFolder = (value: FolderFilter) => {
    setFolder(value)
    loadPage(value)
  }

  const uploadFile = async (file: File) => {
    setUploadProgress(0)
    try {
      const uploaded = await uploadImageFile({
        file,
        folder: uploadFolder,
        onProgress: setUploadProgress,
      })
      toast.success("Photo uploaded.")
      if (folder === "all" || folder === uploadFolder) {
        setAssets((current) => [uploaded, ...current.filter((asset) => asset.key !== uploaded.key)])
      } else {
        changeFolder(uploadFolder)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image.")
    } finally {
      setUploadProgress(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media"
        description="Upload and manage the site photos stored in the tastingswithtay RustFS bucket."
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload a photo</CardTitle>
          <CardDescription>
            Pick where the photo belongs so the library stays easy to browse. Photos are resized and
            optimized automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-md border border-dashed p-4">
            <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)]">
              <Select
                value={uploadFolder}
                onValueChange={(value) => setUploadFolder(value as ManagedAssetFolder)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {managedAssetFolders.map((option) => (
                    <SelectItem key={option} value={option}>
                      {capitalize(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="file"
                accept={imageUploadAccept}
                disabled={uploadProgress !== null}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  event.currentTarget.value = ""
                  if (file) void uploadFile(file)
                }}
              />
            </div>
            {uploadProgress !== null ? (
              <div className="mt-3">
                <UploadProgressBar fraction={uploadProgress} />
              </div>
            ) : null}
          </div>

          <div className="rounded-md border p-4">
            <div className="text-sm font-medium">Browse folder</div>
            <div className="mt-3">
              <Select value={folder} onValueChange={(value) => changeFolder(value as FolderFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All images</SelectItem>
                  {managedAssetFolders.map((option) => (
                    <SelectItem key={option} value={option}>
                      {capitalize(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.key} className="overflow-hidden">
            <div className="aspect-[4/3] bg-muted">
              <img
                src={imagePreviewSrcFor(asset.url) ?? asset.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <CardContent className="space-y-3 p-4">
              <div>
                <div className="break-all text-sm font-medium">{asset.key}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatBytes(asset.size)} • {formatAdminDate(asset.lastModified)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard?.writeText(asset.url)
                    toast.success("Image path copied.")
                  }}
                >
                  Copy URL
                </Button>
                <ConfirmDeleteButton
                  title="Delete this photo?"
                  description="The file is removed from storage permanently. Photos still used by site content are protected and cannot be deleted."
                  disabled={isPending}
                  onConfirm={() => {
                    startTransition(async () => {
                      try {
                        await deleteManagedAsset({ data: { key: asset.key } })
                        setAssets((current) => current.filter((item) => item.key !== asset.key))
                        toast.success("Photo deleted.")
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : "Could not delete image.",
                        )
                      }
                    })
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {isPending ? "Loading images..." : "No images found in this folder yet."}
          </CardContent>
        </Card>
      ) : null}

      {nextCursor ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => loadPage(folder, nextCursor)}
          >
            {isPending ? "Loading..." : "Load more photos"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
