import { isManagedImageValue, managedImageProxySrc } from "@twt/core/images/policy"

export type ImageHealth = {
  status: "ready" | "missing" | "legacy"
  label: string
  description: string
}

function isLegacyPublicImageValue(value: string | null | undefined): boolean {
  const trimmed = value?.trim()
  if (!trimmed || !trimmed.startsWith("/")) return false
  if (isManagedImageValue(trimmed)) return false

  return /\.(avif|gif|heic|heif|jpe?g|png|svg|webp)([#?].*)?$/i.test(trimmed)
}

export function imageHealthFor(value: string | null | undefined): ImageHealth {
  if (isManagedImageValue(value)) {
    return {
      status: "ready",
      label: "Image uploaded",
      description: "This points at RustFS/CDN content.",
    }
  }

  if (isLegacyPublicImageValue(value)) {
    return {
      status: "legacy",
      label: "Replace image",
      description: "This is an old bundled public image path. Upload a real photo.",
    }
  }

  return {
    status: "missing",
    label: "Upload image",
    description: "No managed image is attached yet.",
  }
}

export function imageHealthClassName(status: ImageHealth["status"]): string {
  if (status === "ready") return "border-emerald-300 bg-emerald-50 text-emerald-800"
  return "border-destructive/40 bg-destructive/10 text-destructive"
}

export function imagePreviewSrcFor(value: string | null | undefined): string | null {
  return managedImageProxySrc(value)
}
