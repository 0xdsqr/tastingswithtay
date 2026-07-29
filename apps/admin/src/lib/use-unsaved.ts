import { useBlocker } from "@tanstack/react-router"
import { useEffect } from "react"

const MESSAGE = "You have unsaved changes. Discard them?"

/**
 * Warns before losing unsaved edits: blocks in-app navigation and the
 * browser's unload. In-page record switches should call `confirmDiscard`.
 */
export function useUnsavedChangesGuard(isDirty: boolean): void {
  useBlocker({
    shouldBlockFn: () => {
      if (!isDirty) return false
      return !window.confirm(MESSAGE)
    },
    enableBeforeUnload: () => isDirty,
  })

  useEffect(() => {
    if (!isDirty) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])
}

export function confirmDiscard(isDirty: boolean): boolean {
  if (!isDirty) return true
  return window.confirm(MESSAGE)
}
