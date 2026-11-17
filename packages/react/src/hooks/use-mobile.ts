import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribe(onChange: () => void): () => void {
  const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mediaQuery.addEventListener("change", onChange)
  return () => mediaQuery.removeEventListener("change", onChange)
}

function getSnapshot(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}
