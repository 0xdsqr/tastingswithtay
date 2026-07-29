import { $, Glob } from "bun"
import { rm } from "node:fs/promises"

await rm("dist", { force: true, recursive: true })

const files = new Glob("./src/**/*.{ts,tsx}").scan() as AsyncIterable<string>
const collectedFiles: string[] = []
for await (const file of files) {
  if (!/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file)) collectedFiles.push(file)
}

await Bun.build({
  format: "esm",
  outdir: "dist/esm",
  external: ["*"],
  root: "src",
  entrypoints: collectedFiles,
})

await $`tsc --outDir dist/types --declaration --emitDeclarationOnly --declarationMap`
