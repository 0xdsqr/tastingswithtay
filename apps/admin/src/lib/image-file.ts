export const supportedImageTypes = ["image/avif", "image/jpeg", "image/png", "image/webp"] as const

export type SupportedImageType = (typeof supportedImageTypes)[number]

export type DetectedImageType = {
  contentType: SupportedImageType
  extension: "avif" | "jpg" | "png" | "webp"
}

function hasBytes(bytes: Uint8Array, offset: number, expected: readonly number[]): boolean {
  return expected.every((value, index) => bytes[offset + index] === value)
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length))
}

/** Detects supported image formats from their file signatures, never from user-supplied MIME data. */
export function detectSupportedImageType(bytes: Uint8Array): DetectedImageType | null {
  if (hasBytes(bytes, 0, [0xff, 0xd8, 0xff])) {
    return { contentType: "image/jpeg", extension: "jpg" }
  }

  if (hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { contentType: "image/png", extension: "png" }
  }

  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return { contentType: "image/webp", extension: "webp" }
  }

  if (ascii(bytes, 4, 4) === "ftyp") {
    for (let offset = 8; offset + 4 <= Math.min(bytes.length, 32); offset += 4) {
      const brand = ascii(bytes, offset, 4)
      if (brand === "avif" || brand === "avis") {
        return { contentType: "image/avif", extension: "avif" }
      }
    }
  }

  return null
}
