#!/usr/bin/env bash
# Recomputes the fixed-output hashes in nix/packages/node-modules-hashes.json
# after a lockfile change. Run from the dev shell: `./nix/update-hashes.sh`.
set -euo pipefail

cd "$(dirname "$0")/.."

file=nix/packages/node-modules-hashes.json
system="$(nix eval --raw --impure --expr builtins.currentSystem)"

set_hash() {
  local updated
  updated="$(mktemp)"
  jq --arg key "$1" --arg hash "$2" '.[$key] = $hash' "$file" >"$updated"
  mv "$updated" "$file"
}

for key in $(jq -r 'keys[]' "$file"); do
  if [ "$key" = otel-runtime ]; then
    attribute="packages.$system.otel-runtime"
  else
    attribute="legacyPackages.$system.nodeModulesFor.$key"
  fi

  # A unique placeholder per build: a shared one maps every target to the same
  # output path, so an interrupted build would block later ones on its lock.
  set_hash "$key" "sha256-$(head -c 32 /dev/urandom | base64)"

  echo "==> $key" >&2
  hash="$(nix build --no-link ".#$attribute" 2>&1 | sed -n 's/^ *got: *//p' | tail -n 1 || true)"
  if [ -z "$hash" ]; then
    echo "could not determine the hash for $key" >&2
    exit 1
  fi

  set_hash "$key" "$hash"
done
