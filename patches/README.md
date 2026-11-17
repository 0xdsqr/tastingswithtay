# Dependency patches

`picomatch@4.0.7.patch` is the runtime portion of
[micromatch/picomatch#194](https://github.com/micromatch/picomatch/pull/194), applied with Bun's
`patchedDependencies` support. It mitigates
[GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), for which no patched npm
release existed when the advisory was reviewed on 2026-11-17.

The audit wrapper verifies the exact patch digest before excluding that one advisory. Remove the
patch, digest check, and exclusion as soon as an official fixed release is available.
