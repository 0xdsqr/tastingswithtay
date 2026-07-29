import type { ManagedAssetFolder } from "@twt/core/images/policy"
import type { ManagedImageAsset } from "./admin-assets"

/**
 * Uploads an image through the multipart endpoint with real progress events
 * (fetch cannot report upload progress, so this uses XHR).
 */
export function uploadImageFile(options: {
  file: File
  folder: ManagedAssetFolder
  onProgress?: (fraction: number) => void
}): Promise<ManagedImageAsset> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.set("folder", options.folder)
    form.set("file", options.file)

    const request = new XMLHttpRequest()
    request.open("POST", "/api/images/upload")
    request.responseType = "json"

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(event.loaded / event.total)
      }
    })

    request.addEventListener("load", () => {
      const body = request.response as { asset?: ManagedImageAsset; error?: string } | null
      if (request.status >= 200 && request.status < 300 && body?.asset) {
        resolve(body.asset)
        return
      }
      reject(new Error(body?.error || "Could not upload image."))
    })

    request.addEventListener("error", () => {
      reject(new Error("Could not upload image. Check your connection and try again."))
    })

    request.send(form)
  })
}
