import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const advisory = "GHSA-fc5q-39xc-vjpf"
const patchPath = resolve(import.meta.dir, "../patches/picomatch@4.0.7.patch")
const expectedPatchDigest = "afbb69412ad37b60f866456cad99eea917690c63be4ee5c4dc38df996399c801"

const patch = await readFile(patchPath)
const patchDigest = createHash("sha256").update(patch).digest("hex")

if (patchDigest !== expectedPatchDigest) {
  throw new Error(
    `Refusing to waive ${advisory}: the reviewed picomatch patch digest changed (${patchDigest}).`,
  )
}

const { default: picomatch } = await import("picomatch")
const maliciousInput = `${"a".repeat(42)}!`
const startedAt = performance.now()
const matched = picomatch("+(?*a)")(maliciousInput)
const elapsedMilliseconds = performance.now() - startedAt

if (matched || elapsedMilliseconds >= 1_000) {
  throw new Error(
    `Refusing to waive ${advisory}: the patched ReDoS regression check failed (${elapsedMilliseconds.toFixed(1)}ms).`,
  )
}

const audit = Bun.spawn(["bun", "audit", "--audit-level=high", "--ignore", advisory], {
  stdin: "ignore",
  stdout: "inherit",
  stderr: "inherit",
})
const exitCode = await audit.exited

if (exitCode !== 0) {
  process.exit(exitCode)
}

console.log(`Verified vendored fix for ${advisory} (${expectedPatchDigest}).`)
