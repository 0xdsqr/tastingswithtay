import { rm } from "node:fs/promises"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "..")
const requestedScope = process.argv[2]

const scopedOutputs: Record<string, readonly string[]> = {
  "apps/admin": [
    "apps/admin/dist",
    "apps/admin/node_modules",
    "apps/admin/.vinxi",
    "apps/admin/.output",
  ],
  "apps/web": ["apps/web/dist", "apps/web/node_modules", "apps/web/.vinxi", "apps/web/.output"],
  "packages/core": ["packages/core/dist", "packages/core/node_modules"],
  "packages/db": ["packages/db/dist", "packages/db/node_modules"],
  "packages/ui": ["packages/ui/node_modules"],
  "tooling/typescript": ["tooling/typescript/node_modules"],
}

const rootOutputs = ["node_modules", ".turbo", ...Object.values(scopedOutputs).flat()] as const

const outputs = requestedScope ? scopedOutputs[requestedScope] : rootOutputs

if (!outputs) {
  throw new Error(`Unknown clean scope: ${requestedScope}`)
}

await Promise.all(
  outputs.map((output) => rm(resolve(root, output), { force: true, recursive: true })),
)
