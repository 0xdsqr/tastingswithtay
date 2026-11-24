/** Turns free-text form fields into stored values, failing with a message the editor can act on. */
import { isManagedImageValue, managedImagePathFor } from "@twt/core/images/policy"
import { Effect } from "effect"
import { parseIngredientGroups, parseInstructionLines } from "../lib/format"
import { AdminError } from "./errors"

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

export const requireSlug = (value: string): Effect.Effect<string, AdminError> => {
  const slug = slugify(value)
  return slug === ""
    ? Effect.fail(
        new AdminError({ message: "Add a slug using lowercase letters, numbers, or hyphens." }),
      )
    : Effect.succeed(slug)
}

export const parseStringList = (value: string | undefined): Array<string> =>
  (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")

export const parseIngredients = (value: string) => {
  const groups = parseIngredientGroups(value)
  return groups.length === 0
    ? Effect.fail(new AdminError({ message: "Add at least one ingredient." }))
    : Effect.succeed(groups)
}

export const parseInstructions = (value: string) => {
  const lines = parseInstructionLines(value)
  return lines.length === 0
    ? Effect.fail(new AdminError({ message: "Add at least one instruction." }))
    : Effect.succeed(lines.map((text, index) => ({ step: index + 1, text })))
}

export const emptyToUndefined = (value: string | null | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** The canonical managed path for an image field, or undefined when the field is empty. */
export const normalizeManagedImage = (
  value: string | null | undefined,
  label: string,
): Effect.Effect<string | undefined, AdminError> => {
  const trimmed = value?.trim()
  if (!trimmed) return Effect.succeed(undefined)
  if (!isManagedImageValue(trimmed)) {
    return Effect.fail(
      new AdminError({
        message: `${label} must be uploaded through the image field before saving.`,
      }),
    )
  }
  return Effect.succeed(managedImagePathFor(trimmed) ?? undefined)
}

export const requireManagedImage = (value: string | null | undefined, label: string) =>
  Effect.flatMap(normalizeManagedImage(value, label), (image) =>
    image === undefined
      ? Effect.fail(new AdminError({ message: `${label} is required before publishing.` }))
      : Effect.succeed(image),
  )

/** Published content must carry an image; drafts may omit it. */
export const imageFor = (published: boolean, value: string | null | undefined, label: string) =>
  published ? requireManagedImage(value, label) : normalizeManagedImage(value, label)
