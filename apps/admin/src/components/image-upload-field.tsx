import type { ManagedAssetFolder } from "@twt/core/images/policy"
import { Badge } from "@twt/react/components/badge"
import { Button } from "@twt/react/components/button"
import { Input } from "@twt/react/components/input"
import { useState } from "react"
import { toast } from "sonner"
import { imageHealthClassName, imageHealthFor, imagePreviewSrcFor } from "../lib/image-health"
import { uploadImageFile } from "../lib/upload-client"
import { Field } from "./form"

export const imageUploadAccept = "image/avif,image/jpeg,image/png,image/webp"

export function UploadProgressBar({ fraction }: { fraction: number }): React.ReactElement {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.round(Math.min(1, fraction) * 100)}%` }}
      />
    </div>
  )
}

export function ImageUploadField({
  label,
  value,
  folder,
  description,
  onChange,
}: {
  label: string
  value: string
  folder: ManagedAssetFolder
  description?: string
  onChange: (value: string) => void
}): React.ReactElement {
  const [progress, setProgress] = useState<number | null>(null)
  const isUploading = progress !== null
  const imageHealth = imageHealthFor(value)
  const previewSrc = imageHealth.status === "ready" ? imagePreviewSrcFor(value) : ""

  const handleFile = async (file: File) => {
    setProgress(0)
    try {
      const uploaded = await uploadImageFile({
        file,
        folder,
        onProgress: setProgress,
      })
      onChange(uploaded.url)
      toast.success("Photo uploaded.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image.")
    } finally {
      setProgress(null)
    }
  }

  return (
    <Field label={label} description={description}>
      <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
        <div
          className={`aspect-[4/3] overflow-hidden rounded-md border ${imageHealthClassName(imageHealth.status)}`}
        >
          {previewSrc ? (
            <img src={previewSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-xs">
              <span className="font-semibold">{imageHealth.label}</span>
              <span>{imageHealth.description}</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={imageHealth.status === "ready" ? "secondary" : "destructive"}>
              {imageHealth.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{imageHealth.description}</span>
          </div>
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
          {isUploading ? <UploadProgressBar fraction={progress ?? 0} /> : null}
          {value && !isUploading ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
              Clear image
            </Button>
          ) : null}
        </div>
      </div>
    </Field>
  )
}
